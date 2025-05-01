package com.example.roflparser.repository;

import com.example.roflparser.domain.PlayerNicknameHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerNicknameHistoryRepository extends JpaRepository<PlayerNicknameHistory, Long> {
    List<PlayerNicknameHistory> findAllByPlayerIdOrderByChangedAtDesc(Long playerId);
}
