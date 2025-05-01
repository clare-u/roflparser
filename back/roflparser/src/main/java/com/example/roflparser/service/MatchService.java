package com.example.roflparser.service;

import com.example.roflparser.domain.*;
import com.example.roflparser.domain.type.Position;
import com.example.roflparser.dto.response.*;
import com.example.roflparser.exception.DuplicateMatchException;
import com.example.roflparser.repository.*;
import com.example.roflparser.service.helper.OpponentStatsAggregator;
import com.example.roflparser.service.helper.TeamworkStatsAggregator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final ClanRepository clanRepository;
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱용
    private final PlayerNicknameHistoryRepository nicknameHistoryRepository;

    /**
     * Swagger 테스트용 - ROFL 파일 파싱만 수행
     */
    @Transactional(readOnly = true)
    public Map<String, Object> parseRoflOnly(MultipartFile file) throws Exception {
        return parseRoflToJson(file);
    }

    /**
     * 도메인별로 클랜 id를 설정하는 함수 - 클랜이 늘어남에 따라 수기 작성 필요
     */
    private Long determineClanIdFromHost(String host) {
        if (host == null) return 1L;
        if (host.contains("roflbot.kro.kr")) return 1L;
        if (host.contains("lolcode.kro.kr")) return 2L;
        return 1L;
    }

    /**
     * ROFL 파일 업로드 및 저장
     */
    @Transactional
    public void handleRoflUpload(MultipartFile file, String host) throws Exception {
        Long clanId = determineClanIdFromHost(host);

        // clanId를 기반으로 Clan 엔티티 조회
        Clan clan = clanRepository.findById(clanId)
                .orElseThrow(() -> new IllegalArgumentException("해당 clanId(" + clanId + ")에 해당하는 클랜이 존재하지 않습니다."));

        String originalFilename = file.getOriginalFilename();
        String matchId = extractMatchIdFromFilename(originalFilename); // 파일명에서 matchId 추출

        if (matchRepository.existsByMatchId(matchId)) {
            throw new DuplicateMatchException(); // 이미 존재하면 예외
        }

        LocalDateTime uploadedAt = LocalDateTime.now(); // 업로드 시간 저장
        Map<String, Object> json = parseRoflToJson(file); // 파일 JSON 파싱

        // log.info("파일: {}, matchId: {}", originalFilename, matchId);
        // log.info("파싱된 JSON: {}", json);
        // log.info("statsJson: {}", json.get("statsJson"));

        // Match 테이블 저장
        Match match = matchRepository.save(Match.builder()
                .matchId(matchId)
                .gameDatetime(LocalDateTime.from(uploadedAt))
                .gameLength(((Number) json.get("gameLength")).longValue())
                .clan(clan)
                .build());

        // 참가자 목록 가져오기
        List<Map<String, String>> participants = (List<Map<String, String>>) json.get("statsJson");

        // 각 참가자 처리
        for (Map<String, String> p : participants) {
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(
                            p.get("RIOT_ID_GAME_NAME"), p.get("RIOT_ID_TAG_LINE"))
                    .orElseGet(() -> playerRepository.save(Player.builder()
                            .riotIdGameName(p.get("RIOT_ID_GAME_NAME"))
                            .riotIdTagLine(p.get("RIOT_ID_TAG_LINE"))
                            .clan(clan)
                            .build()));

            matchParticipantRepository.save(MatchParticipant.builder()
                    .match(match)
                    .player(player)
                    .champion(p.get("SKIN"))
                    .team(p.get("TEAM"))
                    .position(Position.valueOf(p.get("TEAM_POSITION")))
                    .win("Win".equalsIgnoreCase(p.get("WIN")))
                    .championsKilled(Integer.parseInt(p.get("CHAMPIONS_KILLED")))
                    .assists(Integer.parseInt(p.get("ASSISTS")))
                    .numDeaths(Integer.parseInt(p.get("NUM_DEATHS")))
                    .build());
        }
    }

    /**
     * 파일명에서 MatchId 숫자만 추출
     */
    private String extractMatchIdFromFilename(String filename) {
        return filename.replaceAll("[^0-9]", "");
    }

    /**
     * ROFL 파일 내용을 JSON으로 변환
     */
    private Map<String, Object> parseRoflToJson(MultipartFile file) throws Exception {
        InputStream fileContent = file.getInputStream();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[1024];
        int nRead;
        while ((nRead = fileContent.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        byte[] roflData = buffer.toByteArray();
        log.info("파일 전체 길이: {}", roflData.length);

        String marker = "{\"gameLength\"";
        byte[] markerBytes = marker.getBytes(StandardCharsets.UTF_8);

        int pos = indexOf(roflData, markerBytes);
        log.info("indexOf 끝났음, pos={}", pos);

        if (pos == -1) {
            log.error("파일 '{}' 에서 gameLength를 시작하는 JSON 블럭을 찾을 수 없습니다.", file.getOriginalFilename());
            throw new IllegalArgumentException("ROFL 파일에서 JSON 블럭을 찾지 못했습니다.");
        }

        String roflString = new String(roflData, pos, roflData.length - pos, StandardCharsets.UTF_8);
        log.info("부분 roflString 변환 끝");

        try {
            Map<String, Object> parsed = objectMapper.readValue(roflString, new TypeReference<>() {});

            String statsJsonRaw = (String) parsed.get("statsJson");
            List<Map<String, String>> statsParsed = objectMapper.readValue(statsJsonRaw, new TypeReference<>() {});
            parsed.put("statsJson", statsParsed);

            log.info("JSON 파싱 성공: {}", parsed.keySet());
            return parsed;
        } catch (Exception e) {
            log.error("파일 '{}' 파싱 중 에러 발생: {}", file.getOriginalFilename(), e.getMessage());
            throw new IllegalArgumentException("ROFL 파일 JSON 파싱 실패: " + e.getMessage());
        }
    }

    // 추가
    private int indexOf(byte[] data, byte[] target) {
        outer:
        for (int i = 0; i <= data.length - target.length; i++) {
            for (int j = 0; j < target.length; j++) {
                if (data[i + j] != target[j]) {
                    continue outer;
                }
            }
            return i;
        }
        return -1;
    }

    /**
     * 플레이어 전적 조회 (도메인별 클랜 ID 적용)
     */
    @Transactional(readOnly = true)
    public List<PlayerStatsResponse> findMatchesByPlayer(String gameName, String tagLine, String sort, String host) {
        Long clanId = determineClanIdFromHost(host);
        List<Player> players;

        if (tagLine != null && !tagLine.isBlank()) {
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(gameName, tagLine)
                    .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
            if (!player.getClan().getId().equals(clanId)) {
                throw new IllegalArgumentException("해당 클랜 소속 플레이어가 아닙니다.");
            }
            players = List.of(player);
        } else {
            players = playerRepository.findAllByRiotIdGameNameIgnoreCaseAndClanIdHasMatchesOrderByMatchCountDesc(gameName, clanId);
            if (players.isEmpty()) {
                throw new IllegalArgumentException("해당 닉네임의 플레이어가 없습니다.");
            }
        }

        return players.stream().map(player -> {
            List<MatchParticipant> parts = "asc".equalsIgnoreCase(sort)
                    ? matchParticipantRepository.findAllByPlayerOrderByMatch_MatchIdAsc(player)
                    : matchParticipantRepository.findAllByPlayerOrderByMatch_MatchIdDesc(player);

            SummaryStats summary = new SummaryStats();
            SummaryStats monthlyStats = new SummaryStats();
            Map<String, SummaryStats> byChampion = new HashMap<>();
            Map<Position, SummaryStats> byPosition = new HashMap<>();
            List<PlayerMatchInfo> matches = new ArrayList<>();
            List<RecentMatchSummary> recentMatches = new ArrayList<>();

            Map<String, TeamworkStatsAggregator> teamworkMap = new HashMap<>();
            Map<String, OpponentStatsAggregator> opponentMap = new HashMap<>();


            for (MatchParticipant p : parts) {
                Match match = p.getMatch();
                List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);

                // 전적 누적
                accumulate(summary, p);
                Position pos = p.getPosition();
                byChampion.computeIfAbsent(p.getChampion(), k -> new SummaryStats());
                accumulate(byChampion.get(p.getChampion()), p);

                byPosition.computeIfAbsent(pos, k -> new SummaryStats());
                accumulate(byPosition.get(pos), p);

                // LocalDateTime으로 저장된 gameDatetime → KST 기준 ZonedDateTime으로 변환
                LocalDateTime gameDatetime = match.getGameDatetime();
                YearMonth thisMonth = YearMonth.from(ZonedDateTime.now(ZoneId.of("Asia/Seoul")));
                YearMonth gameMonth = YearMonth.from(gameDatetime.atZone(ZoneId.of("Asia/Seoul")));

                if (thisMonth.equals(gameMonth)) {
                    accumulate(monthlyStats, p);
                }

                // 최근 10경기
                if (recentMatches.size() < 10) {
                    recentMatches.add(RecentMatchSummary.builder()
                            .win(p.getWin())
                            .champion(p.getChampion())
                            .kills(p.getChampionsKilled())
                            .deaths(p.getNumDeaths())
                            .assists(p.getAssists())
                            .build());
                }

                // 팀워크 통계 수집
                for (MatchParticipant other : participants) {
                    if (other == p || !other.getTeam().equals(p.getTeam())) continue;

                    String key = other.getPlayer().getRiotIdGameName() + "#" + other.getPlayer().getRiotIdTagLine();
                    teamworkMap.computeIfAbsent(key, k -> new TeamworkStatsAggregator(other.getPlayer()));
                    teamworkMap.get(key).addGame(p.getWin());
                }

                // 맞라인 통계 수집
                for (MatchParticipant enemy : participants) {
                    if (enemy == p || enemy.getTeam().equals(p.getTeam())) continue;

                    if (enemy.getPosition() == p.getPosition()) {
                        String key = enemy.getPlayer().getRiotIdGameName() + "#" + enemy.getPlayer().getRiotIdTagLine();
                        opponentMap.computeIfAbsent(key, k -> new OpponentStatsAggregator(enemy.getPlayer()));
                        opponentMap.get(key).addGame(p.getWin());
                    }
                }

                matches.add(PlayerMatchInfo.builder()
                        .match(MatchDetailResponse.from(match, participants))
                        .win(p.getWin())
                        .build());
            }

            // 계산
            summary.setKda(calcKda(summary));
            summary.calcWinRate();
            calcAverageStats(summary);

            monthlyStats.setKda(calcKda(monthlyStats));
            monthlyStats.calcWinRate();
            calcAverageStats(monthlyStats);

            byChampion.values().forEach(stat -> {
                stat.setKda(calcKda(stat));
                calcAverageStats(stat);
                stat.calcWinRate();
            });

            byPosition.values().forEach(stat -> {
                stat.setKda(calcKda(stat));
                calcAverageStats(stat);
                stat.calcWinRate();
            });

            // 모스트 챔피언 상위 10
            List<ChampionStats> mostPlayedChampions = byChampion.entrySet().stream()
                    .sorted((a, b) -> b.getValue().getMatches() - a.getValue().getMatches())
                    .limit(10)
                    .map(entry -> ChampionStats.builder()
                            .champion(entry.getKey())
                            .matches(entry.getValue().getMatches())
                            .winRate(entry.getValue().getWinRate())
                            .kda(entry.getValue().getKda())
                            .build())
                    .toList();

            // 팀워크 좋은 팀원 (5전 이상 + 승률 >= 50%)
            List<TeamworkStats> bestTeamwork = teamworkMap.values().stream()
                    .filter(t -> t.getMatches() >= 5 && t.getWinRate() >= 50.0)
                    .sorted((a, b) -> Double.compare(b.getWinRate(), a.getWinRate()))
                    .limit(10)
                    .map(TeamworkStatsAggregator::toDto)
                    .toList();

            // 팀워크 안 좋은 팀원 (5전 이상 + 승률 < 50%)
            List<TeamworkStats> worstTeamwork = teamworkMap.values().stream()
                    .filter(t -> t.getMatches() >= 5 && t.getWinRate() < 50.0)
                    .sorted(Comparator.comparingDouble(TeamworkStatsAggregator::getWinRate))
                    .limit(10)
                    .map(TeamworkStatsAggregator::toDto)
                    .toList();

            // 맞라인 강한 상대 (5전 이상 + 승률 >= 50%)
            List<OpponentStats> bestLaneOpponents = opponentMap.values().stream()
                    .filter(o -> o.getMatches() >= 5 && o.getWinRate() >= 50.0)
                    .sorted((a, b) -> Double.compare(b.getWinRate(), a.getWinRate()))
                    .limit(10)
                    .map(OpponentStatsAggregator::toDto)
                    .toList();

            // 맞라인 약한 상대 (5전 이상 + 승률 < 50%)
            List<OpponentStats> worstLaneOpponents = opponentMap.values().stream()
                    .filter(o -> o.getMatches() >= 5 && o.getWinRate() < 50.0)
                    .sorted(Comparator.comparingDouble(OpponentStatsAggregator::getWinRate))
                    .limit(10)
                    .map(OpponentStatsAggregator::toDto)
                    .toList();

            return PlayerStatsResponse.builder()
                    .gameName(player.getRiotIdGameName())
                    .tagLine(player.getRiotIdTagLine())
                    .summary(summary)
                    .monthlyStats(monthlyStats)
                    .byChampion(byChampion)
                    .byPosition(byPosition)
                    .matches(matches)
                    .recentMatches(recentMatches)
                    .mostPlayedChampions(mostPlayedChampions)
                    .bestTeamwork(bestTeamwork)
                    .worstTeamwork(worstTeamwork)
                    .bestLaneOpponents(bestLaneOpponents)
                    .worstLaneOpponents(worstLaneOpponents)
                    .build();
        }).toList();
    }

    /**
     * 닉네임 변경
     */
    @Transactional
    public void updatePlayerNickname(String oldGameName, String oldTagLine, String newGameName, String newTagLine, String host) {
        Long clanId = determineClanIdFromHost(host);

        Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(oldGameName, oldTagLine)
                .orElseThrow(() -> new IllegalArgumentException("기존 닉네임의 플레이어를 찾을 수 없습니다."));

        if (!player.getClan().getId().equals(clanId)) {
            throw new IllegalArgumentException("해당 클랜 소속의 플레이어가 아닙니다.");
        }

        // 동일한 새 닉네임이 이미 존재하는지 체크
        Optional<Player> existing = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(newGameName, newTagLine);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }

        // 이력 저장
        PlayerNicknameHistory history = PlayerNicknameHistory.builder()
                .player(player)
                .oldGameName(player.getRiotIdGameName())
                .oldTagLine(player.getRiotIdTagLine())
                .newGameName(newGameName)
                .newTagLine(newTagLine)
                .changedAt(LocalDateTime.now())
                .build();

        nicknameHistoryRepository.save(history);

        player.setRiotIdGameName(newGameName);
        player.setRiotIdTagLine(newTagLine);
    }


    /**
     * 전체 매치 조회 (MatchId 기준 정렬)
     */
    @Transactional(readOnly = true)
    public List<MatchDetailResponse> findAllMatches(String sort, String host) {
        Long clanId = determineClanIdFromHost(host);

        List<Match> matches = "asc".equalsIgnoreCase(sort)
                ? matchRepository.findAllByOrderByMatchIdAsc()
                : matchRepository.findAllByOrderByMatchIdDesc();

        return matches.stream()
                .map(match -> MatchDetailResponse.from(
                        match, matchParticipantRepository.findAllByMatch(match)))
                .collect(Collectors.toList());
    }

    /**
     * MatchId로 매치 상세 조회
     */
    @Transactional(readOnly = true)
    public MatchDetailResponse findMatchByMatchId(String matchId, String host) {
        Long clanId = determineClanIdFromHost(host);

        Match match = matchRepository.findByMatchIdAndClanId(matchId, clanId)
                .orElseThrow(() -> new IllegalArgumentException("해당 matchId의 경기를 찾을 수 없습니다."));

        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);
        return MatchDetailResponse.from(match, participants);
    }

    /**
     * 닉네임으로 플레이어 목록 조회
     */
    @Transactional(readOnly = true)
    public List<PlayerSimpleResponse> findPlayersByNickname(String nickname, String host) {
        Long clanId = determineClanIdFromHost(host);

        if (nickname == null || nickname.isBlank()) {
            // 닉네임 없으면 클랜 소속 전체 플레이어 조회
            return playerRepository.findAllByClanIdHasMatchesOrderByMatchCountDesc(clanId).stream()
                    .map(PlayerSimpleResponse::from)
                    .toList();
        } else {
            return playerRepository.findAllByRiotIdGameNameAndClanIdHasMatchesOrderByMatchCountDesc(nickname, clanId).stream()
                    .map(PlayerSimpleResponse::from)
                    .toList();
        }
    }




    /**
     * SummaryStats에 스탯 누적
     */
    private void accumulate(SummaryStats stats, MatchParticipant p) {
        if (stats == null || p == null) return;

        stats.setMatches(stats.getMatches() + 1);

        boolean win = Boolean.TRUE.equals(p.getWin());
        stats.setWins(stats.getWins() + (win ? 1 : 0));
        stats.setLosses(stats.getLosses() + (win ? 0 : 1));

        stats.setKills(stats.getKills() + safeInt(p.getChampionsKilled()));
        stats.setDeaths(stats.getDeaths() + safeInt(p.getNumDeaths()));
        stats.setAssists(stats.getAssists() + safeInt(p.getAssists()));


    }

    /**
     * Integer -> int null-safe 변환
     */
    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    /**
     * KDA 수치 계산
     */
    private double calcKda(SummaryStats stat) {
        return stat.getDeaths() == 0
                ? stat.getKills() + stat.getAssists()
                : (double) (stat.getKills() + stat.getAssists()) / stat.getDeaths();
    }

    /**
     * 판수로 평균 K/D/A 계산
     */
    private void calcAverageStats(SummaryStats stat) {
        if (stat.getMatches() == 0) {
            stat.setAvgKills(0);
            stat.setAvgDeaths(0);
            stat.setAvgAssists(0);
            return;
        }
        stat.setAvgKills((double) stat.getKills() / stat.getMatches());
        stat.setAvgDeaths((double) stat.getDeaths() / stat.getMatches());
        stat.setAvgAssists((double) stat.getAssists() / stat.getMatches());
    }
}
