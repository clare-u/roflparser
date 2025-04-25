package com.example.roflparser.dto.response;

import com.example.roflparser.domain.Player;
import lombok.Builder;

@Builder
public record PlayerSimpleResponse(
        String riotIdGameName,
        String riotIdTagLine
) {
    public static PlayerSimpleResponse from(Player player) {
        return PlayerSimpleResponse.builder()
                .riotIdGameName(player.getRiotIdGameName())
                .riotIdTagLine(player.getRiotIdTagLine())
                .build();
    }
}
