package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ClanStatisticsResponse {
    private List<ClanPlayerDto> players;

    @Getter
    @Builder
    public static class ClanPlayerDto {
        private String gameName;
        private int matches;
    }
}
