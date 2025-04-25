package com.example.roflparser.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatsResponse {

    private String gameName;
    private String tagLine;

    private SummaryStats summary;
    private Map<String, SummaryStats> byChampion;
    private Map<String, SummaryStats> byPosition;

    private List<PlayerMatchInfo> matches;
}
