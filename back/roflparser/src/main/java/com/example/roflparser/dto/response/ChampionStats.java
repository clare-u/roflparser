package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChampionStats {
    private String champion;
    private int matches;
    private double winRate;
    private double kda;
}
