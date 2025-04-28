package com.example.roflparser.dto.request;

import lombok.Getter;

import java.util.Map;

@Getter
public class PlayerPositionRequest {
    private String nickname;
    private String tagLine;
    private Map<String, String> positions;
}
