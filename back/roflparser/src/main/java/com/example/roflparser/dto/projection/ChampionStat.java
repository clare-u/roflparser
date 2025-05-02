package com.example.roflparser.dto.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChampionStat {
    private String champion;
    private long matches;
    private long wins;
    private long losses;
    private double pickRate;  // 쿼리에서 직접 계산한 픽률 포함

    public double getWinRate() {
        return matches == 0 ? 0 : (double) wins / matches * 100.0;
    }
}
