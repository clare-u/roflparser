package com.example.roflparser.dto.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PlayerMatchSummary {
    private String gameName;
    private long matches;
}

