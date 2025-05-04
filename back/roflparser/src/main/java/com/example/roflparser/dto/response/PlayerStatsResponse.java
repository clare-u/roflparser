package com.example.roflparser.dto.response;

import com.example.roflparser.domain.type.Position;
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
    private Map<Position, SummaryStats> byPosition;

    private List<PlayerMatchInfo> matches;

    private SummaryStats monthlyStats; // 이번 달 전적
    private List<RecentMatchSummary> recentMatches; // 최근 10전
    private List<TeamworkStats> bestTeamwork; // 팀워크 좋은 팀원
    private List<TeamworkStats> worstTeamwork; // 팀워크 안 좋은 팀원
    private List<ChampionStats> mostPlayedChampions; // 모스트픽 챔피언
    private List<OpponentStats> bestLaneOpponents; // 맞라인 승률 좋은 상대
    private List<OpponentStats> worstLaneOpponents; // 맞라인 승률 안좋은 상대

    // 페이지네이션
    private int totalItems;
    private int currentPage;
    private int pageSize;

}
