package com.example.roflparser.service.helper;

import com.example.roflparser.domain.Player;
import com.example.roflparser.dto.response.TeamworkStats;
import lombok.Getter;

@Getter
public class TeamworkStatsAggregator {
    private final String gameName;
    private final String tagLine;
    private int matches = 0;
    private int wins = 0;
    private int losses = 0;

    public TeamworkStatsAggregator(Player player) {
        this.gameName = player.getRiotIdGameName();
        this.tagLine = player.getRiotIdTagLine();
    }

    public void addGame(boolean win) {
        matches++;
        if (win) wins++;
        else losses++;
    }

    public double getWinRate() {
        return matches > 0 ? (double) wins / matches * 100.0 : 0.0;
    }

    public TeamworkStats toDto() {
        return TeamworkStats.builder()
                .gameName(gameName)
                .tagLine(tagLine)
                .matches(matches)
                .wins(wins)
                .losses(losses)
                .winRate(Math.round(getWinRate() * 100.0) / 100.0) // 소수점 둘째 자리까지
                .build();
    }
}
