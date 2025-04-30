package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamworkStats {
    private String gameName;    // 닉네임
    private String tagLine;     // 태그라인
    private int matches;        // 같이한 경기 수
    private int wins;           // 같이 이긴 경기 수
    private int losses;         // 같이 진 경기 수
    private double winRate;     // 승률 (00.00)
}
