package com.example.roflparser.controller;

import com.example.roflparser.exception.DuplicateMatchException;
import com.example.roflparser.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/rofl")
@RequiredArgsConstructor
public class RoflController {

    private final MatchService matchService;

    @Operation(
            summary = "ROFL 파일 업로드",
            description = "사용자가 업로드한 ROFL 파일을 분석하여 DB에 저장합니다. 이미 등록된 matchId인 경우 오류를 반환합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "업로드 성공"),
            @ApiResponse(responseCode = "400", description = "이미 등록된 경기입니다", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping("/upload")
    public ResponseEntity<?> uploadRoflFile(
            @RequestParam("file") MultipartFile file) {
        try {
            matchService.handleRoflUpload(file);
            return ResponseEntity.ok("경기 업로드에 성공했습니다.");
        } catch (DuplicateMatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }
}
