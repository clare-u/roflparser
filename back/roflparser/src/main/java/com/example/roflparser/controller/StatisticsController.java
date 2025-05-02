package com.example.roflparser.controller;

import com.example.roflparser.dto.response.ChampionStatisticsResponse;
import com.example.roflparser.dto.response.ClanStatisticsResponse;
import com.example.roflparser.dto.response.PlayerStatisticsResponse;
import com.example.roflparser.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "통계 API", description = "내전 통계를 조회하는 API")
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * 챔피언별 통계 API
     * 인기챔프, 1티어, 5티어 챔피언 정보를 제공
     */
    @Operation(summary = "챔피언 통계 조회", description = "해당 월의 클랜 내전에서 인기/1티어/5티어 챔피언 통계를 조회합니다.")
    @GetMapping("/champion")
    public ChampionStatisticsResponse getChampionStatistics(
            @Parameter(description = "조회할 월 (예: 2025-04)", example = "2025-04")
            @RequestParam String month,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return statisticsService.getChampionStatistics(month, origin);
    }

    /**
     * 플레이어 통계 API
     * - 경기 수 상위 20명
     * - 승률 상위 20명
     * - 1/5티어 챔피언
     */
    @Operation(summary = "플레이어 통계 조회", description = "해당 월의 클랜 내전에서 경기 수/승률 상위 플레이어와 티어 챔피언을 조회합니다.")
    @GetMapping("/player")
    public PlayerStatisticsResponse getPlayerStatistics(
            @Parameter(description = "조회할 월 (예: 2025-04)", example = "2025-04")
            @RequestParam String month,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return statisticsService.getPlayerStatistics(month, origin);
    }

    /**
     * 클랜 전체 플레이어 통계 API
     * - 한 판이라도 한 모든 플레이어 + 전적
     */
    @Operation(summary = "클랜 전체 통계 조회", description = "해당 월에 1판이라도 참여한 모든 플레이어의 전적을 조회합니다.")
    @GetMapping("/clan")
    public ClanStatisticsResponse getClanStatistics(
            @Parameter(description = "조회할 월 (예: 2025-04)", example = "2025-04")
            @RequestParam String month,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return statisticsService.getClanStatistics(month, origin);
    }
}
