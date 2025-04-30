package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentMatchSummary {
    private boolean win;
    private String champion;
    private int kills;
    private int deaths;
    private int assists;
}
