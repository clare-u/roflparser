package com.example.roflparser.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerMatchInfo {
    private MatchDetailResponse match; // 전체 경기 정보
    private Boolean win;               // 해당 플레이어의 승리 여부
}
