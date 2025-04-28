package com.example.roflparser.repository;

import com.example.roflparser.domain.Player;
import com.example.roflparser.domain.PlayerPosition;
import com.example.roflparser.domain.type.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlayerPositionRepository extends JpaRepository<PlayerPosition, Long> {

    // 특정 플레이어의 모든 포지션별 정보 가져오기
    List<PlayerPosition> findByPlayerId(Long playerId);

    // 특정 플레이어의 특정 포지션 정보 가져오기
    PlayerPosition findByPlayerIdAndPosition(Long playerId, Position position);

    // 특정 플레이어가 가진 모든 포지션과 TierLineScore까지 fetch join으로 가져오기
    @Query("SELECT pp FROM PlayerPosition pp " +
            "JOIN FETCH pp.tierLineScore " +
            "WHERE pp.player.id = :playerId")
    List<PlayerPosition> findAllWithTierLineScoreByPlayerId(@Param("playerId") Long playerId);

    // 특정 플레이어의 모든 포지션 삭제
    void deleteByPlayerId(Long playerId);

    // 특정 플레이어의 모든 포지션 가져오기 (Player 객체 기준)
    List<PlayerPosition> findByPlayer(Player player);

}
