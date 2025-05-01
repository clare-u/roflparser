package com.example.roflparser.repository;

import com.example.roflparser.domain.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {

    // Match ID 중복 확인
    boolean existsByMatchId(String matchId);

    // Match ID로 단건 조회
    Optional<Match> findByMatchId(String matchId);

    // 전체 경기 - 최신순 정렬
    List<Match> findAllByOrderByGameDatetimeDesc();

    // 전체 경기 - 오래된순 정렬
    List<Match> findAllByOrderByGameDatetimeAsc();

    // 전체 경기 - MatchId 순 최신순, 오래된순 정렬
    List<Match> findAllByOrderByMatchIdAsc();
    List<Match> findAllByOrderByMatchIdDesc();

    // matchId + clanId로 조회 (클랜별 match 조회용)
    Optional<Match> findByMatchIdAndClanId(String matchId, Long clanId);

    // clanId - MatchId 순 최신순, 오래된순 정렬
    List<Match> findAllByIdInOrderByMatchIdAsc(List<Long> ids);
    List<Match> findAllByIdInOrderByMatchIdDesc(List<Long> ids);
    
}
