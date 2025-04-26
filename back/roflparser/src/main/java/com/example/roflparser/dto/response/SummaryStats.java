package com.example.roflparser.dto.response;

import lombok.*;

/**
 * 플레이어 전적 요약 통계
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryStats {
    private int matches;     // 판 수
    private int wins;        // 승리 수
    private int losses;      // 패배 수
    private int kills;       // 총 킬 수
    private int deaths;      // 총 데스 수
    private int assists;     // 총 어시스트 수
    private double kda;      // KDA 수치

    private double avgKills;    // 판당 평균 킬
    private double avgDeaths;   // 판당 평균 데스
    private double avgAssists;  // 판당 평균 어시스트
}
