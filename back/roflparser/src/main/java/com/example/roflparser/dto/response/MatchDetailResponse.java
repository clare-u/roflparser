package com.example.roflparser.dto.response;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class MatchDetailResponse {

    private String matchId;
    private LocalDateTime gameDatetime;
    private Integer gameLength;
    private List<PlayerInfo> players;

    public static MatchDetailResponse from(Match match, List<MatchParticipant> participants) {
        return MatchDetailResponse.builder()
                .matchId(match.getMatchId())
                .gameDatetime(match.getGameDatetime())
                .gameLength(match.getGameLength())
                .players(participants.stream()
                        .map(PlayerInfo::from)
                        .collect(Collectors.toList()))
                .build();
    }

    @Getter
    @Builder
    public static class PlayerInfo {
        private String riotIdGameName;
        private String riotIdTagLine;
        private String champion;
        private String team;
        private String position;
        private Boolean win;
        private Integer kills;
        private Integer deaths;
        private Integer assists;

        public static PlayerInfo from(MatchParticipant mp) {
            return PlayerInfo.builder()
                    .riotIdGameName(mp.getPlayer().getRiotIdGameName())
                    .riotIdTagLine(mp.getPlayer().getRiotIdTagLine())
                    .champion(mp.getChampion())
                    .team(mp.getTeam())
                    .position(mp.getPosition().name())
                    .win(mp.getWin())
                    .kills(mp.getChampionsKilled())
                    .deaths(mp.getNumDeaths())
                    .assists(mp.getAssists())
                    .build();
        }
    }
}
