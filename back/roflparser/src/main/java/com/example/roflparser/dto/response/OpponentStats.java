package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OpponentStats {
    private String gameName;    // 상대 닉네임
    private String tagLine;     // 상대 태그라인
    private int matches;        // 맞라인 경기 수
    private int wins;           // 내가 이긴 경기 수
    private int losses;         // 내가 진 경기 수
    private double winRate;     // 승률 (00.00)
}
