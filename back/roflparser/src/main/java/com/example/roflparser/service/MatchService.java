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

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱용

    // Swagger 전용 (디버깅용)
    @Transactional(readOnly = true)
    public Map<String, Object> parseRoflOnly(MultipartFile file) throws Exception {
        return parseRoflToJson(file);
    }


    /**
     * ROFL 파일을 업로드하고 match, player, participant 데이터 저장
     */
    @Transactional
    public void handleRoflUpload(MultipartFile file) throws Exception {
        // 1. 파일명에서 MatchId 추출
        String originalFilename = file.getOriginalFilename();
        String matchId = extractMatchIdFromFilename(originalFilename); // "KR-7610933923.rofl" -> "7610933923"

        // 2. 중복 MatchId 존재 여부 확인
        if (matchRepository.existsByMatchId(matchId)) {
            throw new DuplicateMatchException();
        }

        // 3. 업로드 시점 저장
        LocalDateTime uploadedAt = LocalDateTime.now();

        // 4. ROFL 파일 내 JSON 파싱
        Map<String, Object> json = parseRoflToJson(file);

        // 5. Match 데이터 저장
        Match match = matchRepository.save(Match.builder()
                .matchId(matchId)
                .gameDatetime(uploadedAt)
                .gameLength((Integer) json.get("gameLength"))
                .build());

        List<Map<String, String>> participants = (List<Map<String, String>>) json.get("statsJson");

        // 6. 참가자 데이터 저장
        for (Map<String, String> p : participants) {
            // 플레이어 존재 여부 확인 후 저장
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
                    .position(Position.valueOf(p.get("TEAM_POSITION")))
                    .win("Win".equalsIgnoreCase(p.get("WIN")))
                    .championsKilled(Integer.parseInt(p.get("CHAMPIONS_KILLED")))
                    .assists(Integer.parseInt(p.get("ASSISTS")))
                    .numDeaths(Integer.parseInt(p.get("NUM_DEATHS")))
                    .build());
        }
    }

    /**
     * 파일명에서 숫자만 추출하여 MatchId 생성
     */
    private String extractMatchIdFromFilename(String filename) {
        return filename.replaceAll("[^0-9]", ""); // "KR-7610933923.rofl" → "7610933923"
    }

    /**
     * ROFL 파일로부터 JSON을 파싱해온다
     */
    private Map<String, Object> parseRoflToJson(MultipartFile file) throws Exception {
        InputStream fileContent = file.getInputStream();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[1024];
        int nRead;

        // 파일 스트림 읽기
        while ((nRead = fileContent.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        byte[] roflData = buffer.toByteArray();
        String roflString = new String(roflData, StandardCharsets.UTF_8);

        // 게임 정보 JSON 블럭 찾기
        String marker = "{\"gameLength\"";
        int pos = roflString.indexOf(marker);

        if (pos >= 0) {
            String jsonStr = roflString.substring(pos);
            Map<String, Object> parsed = objectMapper.readValue(jsonStr, new TypeReference<>() {});

            // statsJson 필드를 다시 파싱해서 넣기
            String statsJsonRaw = (String) parsed.get("statsJson");
            List<Map<String, String>> statsParsed = objectMapper.readValue(statsJsonRaw, new TypeReference<>() {});
            parsed.put("statsJson", statsParsed);

            return parsed;
        } else {
            throw new IllegalArgumentException("게임 JSON 블럭을 찾을 수 없습니다.");
        }
    }

    /**
     * 특정 플레이어의 모든 전적 조회 (닉네임+태그라인 or 닉네임만)
     */
    @Transactional(readOnly = true)
    public List<PlayerStatsResponse> findMatchesByPlayer(String gameName, String tagLine, String sort) {
        List<Player> players;

        // 닉네임+태그라인으로 플레이어 찾기
        if (tagLine != null && !tagLine.isBlank()) {
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(gameName, tagLine)
                    .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
            players = List.of(player);
        } else {
            // 닉네임만으로 찾기
            players = playerRepository.findAllByRiotIdGameName(gameName);
            if (players.isEmpty()) {
                throw new IllegalArgumentException("해당 닉네임의 플레이어가 없습니다.");
            }
        }

        return players.stream()
                .map(player -> {
                    // 매치 참가 정보 정렬해서 가져오기
                    List<MatchParticipant> parts = "asc".equalsIgnoreCase(sort)
                            ? matchParticipantRepository.findAllByPlayerOrderByMatch_GameDatetimeAsc(player)
                            : matchParticipantRepository.findAllByPlayerOrderByMatch_GameDatetimeDesc(player);

                    SummaryStats summary = new SummaryStats();
                    Map<String, SummaryStats> byChampion = new HashMap<>();
                    Map<Position, SummaryStats> byPosition = new HashMap<>();
                    List<PlayerMatchInfo> matches = new ArrayList<>();

                    for (MatchParticipant p : parts) {
                        // 전체 요약 통계 누적
                        accumulate(summary, p);

                        // 챔피언별 통계 누적
                        byChampion.computeIfAbsent(p.getChampion(), k -> new SummaryStats());
                        accumulate(byChampion.get(p.getChampion()), p);

                        // 포지션별 통계 누적
                        Position pos = p.getPosition();
                        byPosition.computeIfAbsent(pos, k -> new SummaryStats());
                        accumulate(byPosition.get(pos), p);

                        // 경기 기록 저장
                        Match match = p.getMatch();
                        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);

                        matches.add(PlayerMatchInfo.builder()
                                .match(MatchDetailResponse.from(match, participants))
                                .win(p.getWin())
                                .build());
                    }

                    // KDA 계산
                    summary.setKda(calcKda(summary));
                    byChampion.values().forEach(stat -> stat.setKda(calcKda(stat)));
                    byPosition.values().forEach(stat -> stat.setKda(calcKda(stat)));

                    // 응답 객체 반환
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
     * MatchId로 특정 매치 조회
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
        return playerRepository.findAllByRiotIdGameName(nickname).stream()
                .map(PlayerSimpleResponse::from)
                .toList();
    }

    /**
     * 전적 누적 계산
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
     * null-safe Integer 변환
     */
    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    /**
     * KDA 계산
     */
    private double calcKda(SummaryStats stat) {
        return stat.getDeaths() == 0
                ? stat.getKills() + stat.getAssists()
                : (double) (stat.getKills() + stat.getAssists()) / stat.getDeaths();
    }
}
