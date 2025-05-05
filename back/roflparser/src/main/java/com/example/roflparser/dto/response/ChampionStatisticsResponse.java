package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ChampionStatisticsResponse {
    private List<ChampionStatDto> popularChampions;
    private List<ChampionScoreDto> tier1Champions;
    private List<ChampionScoreDto> tier5Champions;

    @Getter
    @Builder
    public static class ChampionStatDto {
        private String name;
        private long matches;
        private long wins;
        private long losses;
        private double winRate;
    }

    @Getter
    @Builder
    public static class ChampionScoreDto {
        private String name;
        private long matches;
        private long wins;
        private long losses;
        private double winRate;
        private double pickRate;
        private double score;
    }
}
