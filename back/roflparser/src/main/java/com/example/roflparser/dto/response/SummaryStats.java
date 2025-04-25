package com.example.roflparser.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryStats {

    private int matches;
    private int wins;
    private int losses;
    private int kills;
    private int deaths;
    private int assists;
    private double kda;

    public double getKda() {
        return deaths == 0 ? kills + assists : (double) (kills + assists) / deaths;
    }
}
