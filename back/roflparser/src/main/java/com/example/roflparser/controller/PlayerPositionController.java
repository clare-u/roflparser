package com.example.roflparser.controller;

import com.example.roflparser.dto.request.PlayerPositionRequest;
import com.example.roflparser.dto.response.PlayerPositionResponse;
import com.example.roflparser.service.PlayerPositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/players")
public class PlayerPositionController {

    private final PlayerPositionService playerPositionService;

    /**
     * 포지션별 티어를 등록하는 API
     * 닉네임과 태그라인을 기준으로 플레이어를 찾아 포지션별 티어를 등록한다.
     */
    @Operation(
            summary = "포지션별 티어 등록",
            description = "닉네임과 태그라인을 기반으로 플레이어를 찾아 5개 포지션(TOP, JUNGLE, MID, ADC, SUPPORT)에 대한 티어를 등록합니다."
    )
    @PostMapping("/positions")
    public ResponseEntity<Map<String, String>> createPlayerPositions(
            @RequestBody PlayerPositionRequest request
    ) {
        playerPositionService.createPlayerPositions(request);
        return ResponseEntity.ok(Map.of("message", "포지션별 티어 등록 완료"));
    }

    /**
     * 특정 플레이어의 포지션별 티어 정보를 조회하는 API
     */
    @Operation(
            summary = "포지션별 티어 조회",
            description = "닉네임을 기반으로 플레이어를 조회하고, 등록된 포지션별 티어 정보를 반환합니다."
    )
    @GetMapping("/{nickname}/positions")
    public ResponseEntity<PlayerPositionResponse> getPlayerPositions(
            @Parameter(description = "플레이어 닉네임 (Riot ID Game Name)", example = "Blue")
            @PathVariable String nickname
    ) {
        return ResponseEntity.ok(playerPositionService.getPlayerPositions(nickname));
    }

    /**
     * 특정 플레이어의 포지션별 티어 정보를 수정하는 API
     * 기존 포지션 정보를 삭제하고, 새로운 정보를 재등록한다.
     */
    @Operation(
            summary = "포지션별 티어 수정",
            description = "닉네임과 태그라인을 기반으로 기존 포지션 정보를 삭제한 후, 새로운 포지션별 티어 정보를 등록합니다."
    )
    @PutMapping("/{nickname}/positions")
    public ResponseEntity<Map<String, String>> updatePlayerPositions(
            @Parameter(description = "플레이어 닉네임 (Riot ID Game Name)", example = "Blue")
            @PathVariable String nickname,
            @RequestBody PlayerPositionRequest request
    ) {
        playerPositionService.updatePlayerPositions(request);
        return ResponseEntity.ok(Map.of("message", "포지션별 티어 수정 완료"));
    }
}
