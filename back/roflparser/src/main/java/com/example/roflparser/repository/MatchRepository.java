package com.example.roflparser.repository;

import com.example.roflparser.domain.Match;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {
    boolean existsByMatchId(String matchId);
}
