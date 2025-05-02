package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PlayerStatisticsResponse {
    private List<PlayerMatchCountDto> topByMatches;
    private List<PlayerWinRateDto> topByWinRate;
    private List<ChampionStatisticsResponse.ChampionScoreDto> tier1Champions;
    private List<ChampionStatisticsResponse.ChampionScoreDto> tier5Champions;

    @Getter
    @Builder
    public static class PlayerMatchCountDto {
        private String gameName;
        private int matches;
    }

    @Getter
    @Builder
    public static class PlayerWinRateDto {
        private String gameName;
        private int wins;
        private double winRate;
        private double kda;
    }
}
