package com.example.roflparser.repository.custom;

import com.example.roflparser.dto.projection.ChampionStat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MatchParticipant에서 챔피언별 통계를 가져오는 커스텀 리포지토리 인터페이스
 */
public interface MatchParticipantRepositoryCustom {
    List<ChampionStat> findChampionStatsByClanAndMonth(Long clanId, LocalDateTime start, LocalDateTime end);
}