package com.example.roflparser.controller;

import com.example.roflparser.domain.type.Position;
import com.example.roflparser.service.BalanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/balance")
@Tag(name = "Balance", description = "내전 밸런스 관련 API")
public class BalanceController {

    private final BalanceService balanceService;

    @Operation(
            summary = "티어-포지션 기본 점수 전체 조회",
            description = "모든 티어/포지션 조합별 기본 점수를 조회합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "성공적으로 티어 점수 목록을 반환했습니다."
    )
    @GetMapping("/scores")
    public Map<String, Map<Position, Double>> getAllTierLineScores() {
        return balanceService.getAllTierLineScores();
    }
}
