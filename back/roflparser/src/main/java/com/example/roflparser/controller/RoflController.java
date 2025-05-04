package com.example.roflparser.controller;

import com.example.roflparser.domain.PlayerNicknameHistory;
import com.example.roflparser.dto.request.NicknameUpdateRequest;
import com.example.roflparser.dto.response.MatchDetailResponse;
import com.example.roflparser.dto.response.PaginatedMatchDetailResponse;
import com.example.roflparser.dto.response.PlayerSimpleResponse;
import com.example.roflparser.dto.response.PlayerStatsResponse;
import com.example.roflparser.exception.DuplicateMatchException;
import com.example.roflparser.repository.PlayerNicknameHistoryRepository;
import com.example.roflparser.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoflController {

    private final MatchService matchService;
    private final PlayerNicknameHistoryRepository nicknameHistoryRepository;

    @Operation(summary = "ROFL 파일 파싱(디버깅용)", description = "ROFL 파일을 업로드하여 게임 정보를 JSON으로 반환합니다.")
    @PostMapping("/parse")
    public Map<String, Object> parseRoflFile(
            @Parameter(description = "업로드할 ROFL 파일", required = true)
            @RequestPart("file") MultipartFile file
    ) throws Exception {
        return matchService.parseRoflOnly(file);
    }

    @Operation(summary = "ROFL 파일 업로드", description = "사용자가 업로드한 ROFL 파일을 분석하여 DB에 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "업로드 성공"),
            @ApiResponse(responseCode = "400", description = "이미 등록된 경기입니다", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping("/rofl/upload")
    public ResponseEntity<?> uploadRoflFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Host") String host
    ) {
        try {
            log.info("ROFL 업로드 시작: {}", file.getOriginalFilename());
            matchService.handleRoflUpload(file, host);
            return ResponseEntity.ok("경기 업로드에 성공했습니다.");
        } catch (DuplicateMatchException e) {
            log.error("중복 매치 예외 발생: {}", file.getOriginalFilename(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("ROFL 업로드 실패: {}", file.getOriginalFilename(), e);
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }

    @Operation(summary = "Code 클랜 ROFL 파일 업로드", description = "code_0501_2015 형식의 파일을 업로드합니다.")
    @PostMapping("/rofl/upload/code")
    public ResponseEntity<?> uploadNewRoflFile(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            log.info("새 클랜 ROFL 업로드 시작: {}", file.getOriginalFilename());
            matchService.handleNewFormatRoflUpload(file);  // 새로운 메서드 호출
            return ResponseEntity.ok("경기 업로드에 성공했습니다.");
        } catch (DuplicateMatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }

    @Operation(summary = "플레이어 통계 조회", description = "닉네임만으로 검색 가능. tagline이 있는 경우 정확히 일치하는 플레이어만 조회됩니다.")
    @GetMapping("/matches/player")
    public ResponseEntity<List<PlayerStatsResponse>> getPlayerStatsByPlayer(
            @RequestParam String nickname,
            @RequestParam(required = false)
            @Parameter(description = "플레이어 태그라인 (예: KR1). 선택값입니다.") String tagline,
            @RequestParam(required = false, defaultValue = "desc")
            @Parameter(description = "정렬 순서 (asc=오래된순, desc=최신순)") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return ResponseEntity.ok(matchService.findMatchesByPlayer(nickname, tagline, sort, origin, page, size));
    }

    @Operation(summary = "전체 경기 목록 조회", description = "저장된 모든 경기 정보를 세부사항과 함께 조회합니다. sort=asc 또는 desc (기본: desc)")
    @GetMapping("/matches")
    public ResponseEntity<PaginatedMatchDetailResponse> getAllMatches(
            @RequestParam(required = false, defaultValue = "desc")
            @Parameter(description = "정렬 순서 (asc=오래된순, desc=최신순)") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return ResponseEntity.ok(matchService.findAllMatches(sort, origin, page, size));
    }

    @Operation(summary = "matchId로 경기 조회", description = "matchId를 기준으로 해당 경기의 세부 정보를 조회합니다.")
    @GetMapping("/matches/{matchId}")
    public ResponseEntity<MatchDetailResponse> getMatchById(
            @PathVariable String matchId,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return ResponseEntity.ok(matchService.findMatchByMatchId(matchId, origin));
    }

    @Operation(summary = "닉네임으로 플레이어 목록 조회", description = "nickname과 일치하는 플레이어들의 태그라인 정보를 조회합니다. nickname이 없으면 전체 플레이어 목록을 반환합니다.")
    @GetMapping("/players")
    public ResponseEntity<List<PlayerSimpleResponse>> getPlayersByNickname(
            @RequestParam(required = false) String nickname,
            HttpServletRequest request
    ) {
        String origin = request.getHeader("Origin");
        return ResponseEntity.ok(matchService.findPlayersByNickname(nickname, origin));
    }

    @Operation(summary = "플레이어 닉네임 변경", description = "기존 게임 이름과 태그라인을 기준으로 플레이어 닉네임을 새 값으로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "닉네임 변경 성공"),
            @ApiResponse(responseCode = "400", description = "입력 오류 또는 중복 닉네임"),
            @ApiResponse(responseCode = "404", description = "기존 닉네임의 플레이어를 찾을 수 없음")
    })
    @PutMapping("/players/nickname")
    public ResponseEntity<?> updateNickname(
            @RequestBody NicknameUpdateRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String origin = httpRequest.getHeader("Origin");
            matchService.updatePlayerNickname(
                    request.getOldGameName(),
                    request.getOldTagLine(),
                    request.getNewGameName(),
                    request.getNewTagLine(),
                    origin
            );
            return ResponseEntity.ok("닉네임이 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
            summary = "플레이어 닉네임 변경 이력 조회",
            description = "특정 플레이어의 닉네임 변경 내역을 최근 변경순으로 조회합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "닉네임 변경 이력 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 플레이어를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/players/{playerId}/nickname-history")
    public ResponseEntity<List<PlayerNicknameHistory>> getNicknameHistory(
            @Parameter(description = "조회할 플레이어 ID", example = "1")
            @PathVariable Long playerId
    ) {
        List<PlayerNicknameHistory> history = nicknameHistoryRepository
                .findAllByPlayerIdOrderByChangedAtDesc(playerId);
        return ResponseEntity.ok(history);

    }

}
