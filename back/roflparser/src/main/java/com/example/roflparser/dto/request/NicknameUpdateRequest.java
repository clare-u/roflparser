package com.example.roflparser.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
public class NicknameUpdateRequest {

    @Schema(description = "기존 게임 이름", example = "Hide on bush")
    private String oldGameName;

    @Schema(description = "기존 태그라인", example = "KR1")
    private String oldTagLine;

    @Schema(description = "새 게임 이름", example = "T1 Faker")
    private String newGameName;

    @Schema(description = "새 태그라인", example = "KR1")
    private String newTagLine;
}