package com.example.roflparser.service;

import com.example.roflparser.domain.Player;
import com.example.roflparser.domain.PlayerPosition;
import com.example.roflparser.domain.type.Position;
import com.example.roflparser.dto.request.PlayerPositionRequest;
import com.example.roflparser.dto.response.PlayerPositionResponse;
import com.example.roflparser.repository.PlayerPositionRepository;
import com.example.roflparser.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlayerPositionService {

    private final PlayerRepository playerRepository;
    private final PlayerPositionRepository playerPositionRepository;

    @Transactional
    public void createPlayerPositions(PlayerPositionRequest request) {
        Player player = findPlayerByNicknameAndTagline(request.getNickname(), request.getTagLine());

        for (Map.Entry<String, String> entry : request.getPositions().entrySet()) {
            if (entry.getValue() == null) continue; // 값이 없으면 저장 안 함

            PlayerPosition playerPosition = PlayerPosition.builder()
                    .player(player)
                    .position(Position.valueOf(entry.getKey()))  // TOP, JUNGLE, MID, etc
                    .tierName(entry.getValue())
                    .tierOrder(0) // TODO: tierOrder는 현재 필요 없으면 0으로 저장
                    .build();

            playerPositionRepository.save(playerPosition);
        }
    }

    @Transactional(readOnly = true)
    public PlayerPositionResponse getPlayerPositions(String nickname) {
        Player player = findPlayerByNickname(nickname);
        List<PlayerPosition> positions = playerPositionRepository.findByPlayer(player);

        Map<String, String> positionMap = new HashMap<>();
        for (PlayerPosition position : positions) {
            positionMap.put(position.getPosition().name(), position.getTierName());
        }

        return PlayerPositionResponse.builder()
                .nickname(player.getRiotIdGameName())
                .tagLine(player.getRiotIdTagLine())
                .positions(positionMap)
                .build();
    }

    @Transactional
    public void updatePlayerPositions(PlayerPositionRequest request) {
        Player player = findPlayerByNicknameAndTagline(request.getNickname(), request.getTagLine());

        // 기존 포지션 삭제
        playerPositionRepository.deleteByPlayerId(player.getId());

        // 새로운 포지션 등록
        createPlayerPositions(request);
    }


    private Player findPlayerByNickname(String nickname) {
        return playerRepository.findAllByRiotIdGameName(nickname).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }

    private Player findPlayerByNicknameAndTagline(String nickname, String tagLine) {
        return playerRepository.findByRiotIdGameNameAndRiotIdTagLine(nickname, tagLine)
                .orElseThrow(() -> new IllegalArgumentException("플레이어를 찾을 수 없습니다."));
    }
}
