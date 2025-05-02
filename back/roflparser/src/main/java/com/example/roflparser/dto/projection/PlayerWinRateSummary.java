package com.example.roflparser.dto.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PlayerWinRateSummary {
    private String gameName;
    private long matches;
    private long wins;
    private long kills;
    private long deaths;
    private long assists;

    public double getWinRate() {
        return matches == 0 ? 0 : (double) wins / matches * 100.0;
    }

    public double getKDA() {
        return deaths == 0 ? (kills + assists) : (double)(kills + assists) / deaths;
    }
}
