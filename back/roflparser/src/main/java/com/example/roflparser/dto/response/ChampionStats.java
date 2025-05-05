package com.example.roflparser.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChampionStats {
    private String champion;
    private int matches;
    private int wins;
    private int losses;
    private int kills;
    private int deaths;
    private int assists;
    private double winRate;
    private double kda;
    private double avgKills;
    private double avgDeaths;
    private double avgAssists;
}
