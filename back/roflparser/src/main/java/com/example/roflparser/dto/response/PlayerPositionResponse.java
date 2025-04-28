package com.example.roflparser.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class PlayerPositionResponse {
    private String nickname;
    private String tagLine;
    private Map<String, String> positions;
}
