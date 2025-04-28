package com.example.roflparser.service;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
import com.example.roflparser.domain.type.Position;
import com.example.roflparser.dto.response.*;
import com.example.roflparser.exception.DuplicateMatchException;
import com.example.roflparser.repository.MatchParticipantRepository;
import com.example.roflparser.repository.MatchRepository;
import com.example.roflparser.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱용

    /**
     * Swagger 테스트용 - ROFL 파일 파싱만 수행
     */
    @Transactional(readOnly = true)
    public Map<String, Object> parseRoflOnly(MultipartFile file) throws Exception {
        return parseRoflToJson(file);
    }

    /**
     * ROFL 파일 업로드 및 저장
     */
    @Transactional
    public void handleRoflUpload(MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename();
        String matchId = extractMatchIdFromFilename(originalFilename); // 파일명에서 matchId 추출

        if (matchRepository.existsByMatchId(matchId)) {
            throw new DuplicateMatchException(); // 이미 존재하면 예외
        }

        LocalDateTime uploadedAt = LocalDateTime.now(); // 업로드 시간 저장
        Map<String, Object> json = parseRoflToJson(file); // 파일 JSON 파싱

        // Match 테이블 저장
        Match match = matchRepository.save(Match.builder()
                .matchId(matchId)
                .gameDatetime(uploadedAt)
                .gameLength((Integer) json.get("gameLength"))
                .build());

        // 참가자 목록 가져오기
        List<Map<String, String>> participants = (List<Map<String, String>>) json.get("statsJson");

        // 각 참가자 처리
        for (Map<String, String> p : participants) {
            // 플레이어 존재하면 가져오고, 없으면 새로 저장
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(
                            p.get("RIOT_ID_GAME_NAME"), p.get("RIOT_ID_TAG_LINE"))
                    .orElseGet(() -> playerRepository.save(Player.builder()
                            .riotIdGameName(p.get("RIOT_ID_GAME_NAME"))
                            .riotIdTagLine(p.get("RIOT_ID_TAG_LINE"))
                            .build()));

            // MatchParticipant 저장
            matchParticipantRepository.save(MatchParticipant.builder()
                    .match(match)
                    .player(player)
                    .champion(p.get("SKIN"))
                    .team(p.get("TEAM"))
                    .position(Position.valueOf(p.get("TEAM_POSITION"))) // Enum으로 변환
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
        String roflString = new String(roflData, StandardCharsets.UTF_8);

        // JSON 시작 위치 찾기
        String marker = "{\"gameLength\"";
        int pos = roflString.indexOf(marker);

        if (pos >= 0) {
            String jsonStr = roflString.substring(pos);
            Map<String, Object> parsed = objectMapper.readValue(jsonStr, new TypeReference<>() {});

            // statsJson 문자열을 파싱하여 다시 넣기
            String statsJsonRaw = (String) parsed.get("statsJson");
            List<Map<String, String>> statsParsed = objectMapper.readValue(statsJsonRaw, new TypeReference<>() {});
            parsed.put("statsJson", statsParsed);

            return parsed;
        } else {
            throw new IllegalArgumentException("게임 JSON 블럭을 찾을 수 없습니다.");
        }
    }

    /**
     * 플레이어 전적 조회
     */
    @Transactional(readOnly = true)
    public List<PlayerStatsResponse> findMatchesByPlayer(String gameName, String tagLine, String sort) {
        List<Player> players;

        // 닉네임+태그라인으로 조회하거나, 닉네임만으로 조회
        if (tagLine != null && !tagLine.isBlank()) {
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(gameName, tagLine)
                    .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
            players = List.of(player);
        } else {
            players = playerRepository.findAllByRiotIdGameName(gameName);
            if (players.isEmpty()) {
                throw new IllegalArgumentException("해당 닉네임의 플레이어가 없습니다.");
            }
        }

        return players.stream()
                .map(player -> {
                    List<MatchParticipant> parts = "asc".equalsIgnoreCase(sort)
                            ? matchParticipantRepository.findAllByPlayerOrderByMatch_GameDatetimeAsc(player)
                            : matchParticipantRepository.findAllByPlayerOrderByMatch_GameDatetimeDesc(player);

                    SummaryStats summary = new SummaryStats();
                    Map<String, SummaryStats> byChampion = new HashMap<>();
                    Map<Position, SummaryStats> byPosition = new HashMap<>();
                    List<PlayerMatchInfo> matches = new ArrayList<>();

                    // 각 경기별 처리
                    for (MatchParticipant p : parts) {
                        accumulate(summary, p);

                        byChampion.computeIfAbsent(p.getChampion(), k -> new SummaryStats());
                        accumulate(byChampion.get(p.getChampion()), p);

                        Position pos = p.getPosition();
                        byPosition.computeIfAbsent(pos, k -> new SummaryStats());
                        accumulate(byPosition.get(pos), p);

                        Match match = p.getMatch();
                        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);

                        matches.add(PlayerMatchInfo.builder()
                                .match(MatchDetailResponse.from(match, participants))
                                .win(p.getWin())
                                .build());
                    }

                    // 종합 스탯 계산
                    summary.setKda(calcKda(summary));
                    calcAverageStats(summary);
                    summary.calcWinRate();

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


                    // 최종 응답 객체 생성
                    return PlayerStatsResponse.builder()
                            .gameName(player.getRiotIdGameName())
                            .tagLine(player.getRiotIdTagLine())
                            .summary(summary)
                            .byChampion(byChampion)
                            .byPosition(byPosition)
                            .matches(matches)
                            .build();
                })
                .toList();
    }

    /**
     * 전체 매치 조회 (MatchId 기준 정렬)
     */
    @Transactional(readOnly = true)
    public List<MatchDetailResponse> findAllMatches(String sort) {
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
    public MatchDetailResponse findMatchByMatchId(String matchId) {
        Match match = matchRepository.findByMatchId(matchId)
                .orElseThrow(() -> new IllegalArgumentException("해당 matchId의 경기를 찾을 수 없습니다."));

        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);
        return MatchDetailResponse.from(match, participants);
    }

    /**
     * 닉네임으로 플레이어 목록 조회
     */
    @Transactional(readOnly = true)
    public List<PlayerSimpleResponse> findPlayersByNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            // 닉네임 있으면 해당 닉네임 검색
            return playerRepository.findAllHasMatchesOrderByMatchCountDesc().stream()
                    .map(PlayerSimpleResponse::from)
                    .toList();
        } else {
            // 닉네임 없으면 전체 반환
            return playerRepository.findAllByRiotIdGameNameHasMatchesOrderByMatchCountDesc(nickname).stream()
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
