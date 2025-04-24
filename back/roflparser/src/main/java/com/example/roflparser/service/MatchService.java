package com.example.roflparser.service;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
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
import java.util.List;
import java.util.Map;

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
                    .win(Boolean.parseBoolean(p.get("WIN")))
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

}
