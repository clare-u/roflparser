package com.example.roflparser.service;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
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

    @Transactional
    public void handleRoflUpload(MultipartFile file) throws Exception {
        // 1. MatchId 추출
        String originalFilename = file.getOriginalFilename();
        String matchId = extractMatchIdFromFilename(originalFilename); // "KR-7610933923.rofl" -> "7610933923"

        // 2. 중복 확인
        if (matchRepository.existsByMatchId(matchId)) {
            throw new DuplicateMatchException();
        }

        // 3. 업로드 시점 시간
        LocalDateTime uploadedAt = LocalDateTime.now();

        // 4. 파일에서 JSON 파싱
        Map<String, Object> json = parseRoflToJson(file);

        // 5. Match 저장
        Match match = matchRepository.save(Match.builder()
                .matchId(matchId)
                .gameDatetime(uploadedAt)
                .gameLength((Integer) json.get("gameLength"))
                .build());

        List<Map<String, String>> participants = (List<Map<String, String>>) json.get("statsJson");

        for (Map<String, String> p : participants) {
            // 6. 플레이어 저장 (존재 확인)
            Player player = playerRepository.findByRiotIdGameNameAndRiotIdTagLine(
                            p.get("RIOT_ID_GAME_NAME"), p.get("RIOT_ID_TAG_LINE"))
                    .orElseGet(() -> playerRepository.save(Player.builder()
                            .riotIdGameName(p.get("RIOT_ID_GAME_NAME"))
                            .riotIdTagLine(p.get("RIOT_ID_TAG_LINE"))
                            .build()));

            // 7. match_participant 저장
            matchParticipantRepository.save(MatchParticipant.builder()
                    .match(match)
                    .player(player)
                    .champion(p.get("SKIN"))
                    .team(p.get("TEAM"))
                    .position(p.get("TEAM_POSITION"))
                    .win("Win".equalsIgnoreCase(p.get("WIN")))
                    .championsKilled(Integer.parseInt(p.get("CHAMPIONS_KILLED")))
                    .assists(Integer.parseInt(p.get("ASSISTS")))
                    .numDeaths(Integer.parseInt(p.get("NUM_DEATHS")))
                    .build());
        }
    }

    private String extractMatchIdFromFilename(String filename) {
        return filename.replaceAll("[^0-9]", ""); // "KR-7610933923.rofl" → "7610933923"
    }

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

        String marker = "{\"gameLength\"";
        int pos = roflString.indexOf(marker);

        if (pos >= 0) {
            String jsonStr = roflString.substring(pos);
            Map<String, Object> parsed = objectMapper.readValue(jsonStr, new TypeReference<>() {});

            // statsJson을 한 번 더 파싱해서 넣어줌
            String statsJsonRaw = (String) parsed.get("statsJson");
            List<Map<String, String>> statsParsed = objectMapper.readValue(statsJsonRaw, new TypeReference<>() {});
            parsed.put("statsJson", statsParsed);

            return parsed;
        } else {
            throw new IllegalArgumentException("게임 JSON 블럭을 찾을 수 없습니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<PlayerStatsResponse> findMatchesByPlayer(String gameName, String tagLine, String sort) {
        List<Player> players;

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
                    Map<String, SummaryStats> byPosition = new HashMap<>();
                    List<PlayerMatchInfo> matches = new ArrayList<>();

                    for (MatchParticipant p : parts) {
                        accumulate(summary, p);

                        byChampion.computeIfAbsent(p.getChampion(), k -> new SummaryStats());
                        accumulate(byChampion.get(p.getChampion()), p);

                        byPosition.computeIfAbsent(p.getPosition(), k -> new SummaryStats());
                        accumulate(byPosition.get(p.getPosition()), p);

                        Match match = p.getMatch();
                        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);

                        matches.add(PlayerMatchInfo.builder()
                                .match(MatchDetailResponse.from(match, participants))
                                .win(p.getWin())
                                .build());
                    }

                    summary.setKda(calcKda(summary));
                    byChampion.values().forEach(stat -> stat.setKda(calcKda(stat)));
                    byPosition.values().forEach(stat -> stat.setKda(calcKda(stat)));

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



    @Transactional(readOnly = true)
    public List<MatchDetailResponse> findAllMatches(String sort) {
        List<Match> matches = "asc".equalsIgnoreCase(sort)
                ? matchRepository.findAllByOrderByGameDatetimeAsc()
                : matchRepository.findAllByOrderByGameDatetimeDesc();

        return matches.stream()
                .map(match -> MatchDetailResponse.from(
                        match, matchParticipantRepository.findAllByMatch(match)))
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public MatchDetailResponse findMatchByMatchId(String matchId) {
        Match match = matchRepository.findByMatchId(matchId)
                .orElseThrow(() -> new IllegalArgumentException("해당 matchId의 경기를 찾을 수 없습니다."));

        List<MatchParticipant> participants = matchParticipantRepository.findAllByMatch(match);

        return MatchDetailResponse.from(match, participants);
    }

    @Transactional(readOnly = true)
    public List<PlayerSimpleResponse> findPlayersByNickname(String nickname) {
        return playerRepository.findAllByRiotIdGameName(nickname).stream()
                .map(PlayerSimpleResponse::from)
                .toList();
    }

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

    // null-safe Integer 처리용 유틸 함수
    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private double calcKda(SummaryStats stat) {
        return stat.getDeaths() == 0
                ? stat.getKills() + stat.getAssists()
                : (double) (stat.getKills() + stat.getAssists()) / stat.getDeaths();
    }






}