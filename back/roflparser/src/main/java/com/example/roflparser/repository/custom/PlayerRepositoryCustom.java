package com.example.roflparser.repository.custom;

import com.example.roflparser.dto.projection.PlayerMatchSummary;
import com.example.roflparser.dto.projection.PlayerWinRateSummary;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 플레이어별 전적 통계를 위한 커스텀 리포지토리 인터페이스
 */
public interface PlayerRepositoryCustom {
    List<PlayerMatchSummary> findTopPlayersByMatchCount(Long clanId, LocalDateTime start, LocalDateTime end);
    List<PlayerWinRateSummary> findTopPlayersByWinRate(Long clanId, LocalDateTime start, LocalDateTime end);
    List<PlayerMatchSummary> findAllPlayersByMatchCount(Long clanId, LocalDateTime start, LocalDateTime end);
}
