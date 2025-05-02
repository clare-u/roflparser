package com.example.roflparser.repository.custom;

import com.example.roflparser.dto.projection.PlayerMatchSummary;
import com.example.roflparser.dto.projection.PlayerWinRateSummary;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 플레이어별 통계 쿼리 구현
 */
@Repository
@RequiredArgsConstructor
public class PlayerRepositoryImpl implements PlayerRepositoryCustom {

    private final EntityManager em;

    @Override
    public List<PlayerMatchSummary> findTopPlayersByMatchCount(Long clanId, LocalDateTime start, LocalDateTime end) {
        return em.createQuery("""
            SELECT new com.example.roflparser.dto.projection.PlayerMatchSummary(
                p.riotIdGameName,
                COUNT(m.id)
            )
            FROM Match m
            JOIN m.participants mp
            JOIN mp.player p
            WHERE p.clan.id = :clanId
              AND m.gameDatetime BETWEEN :start AND :end
            GROUP BY p.riotIdGameName
            ORDER BY COUNT(m.id) DESC
        """, PlayerMatchSummary.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .setMaxResults(20)
                .getResultList();
    }

    @Override
    public List<PlayerWinRateSummary> findTopPlayersByWinRate(Long clanId, LocalDateTime start, LocalDateTime end) {
        return em.createQuery("""
            SELECT new com.example.roflparser.dto.projection.PlayerWinRateSummary(
                p.riotIdGameName,
                COUNT(mp.id),
                SUM(CASE WHEN mp.win = true THEN 1 ELSE 0 END),
                SUM(mp.kills),
                SUM(mp.deaths),
                SUM(mp.assists)
            )
            FROM MatchParticipant mp
            JOIN mp.match m
            JOIN mp.player p
            WHERE p.clan.id = :clanId
              AND m.gameDatetime BETWEEN :start AND :end
            GROUP BY p.riotIdGameName
            HAVING COUNT(mp.id) >= 5
            ORDER BY (SUM(CASE WHEN mp.win = true THEN 1.0 ELSE 0 END) / COUNT(mp.id)) DESC
        """, PlayerWinRateSummary.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .setMaxResults(20)
                .getResultList();
    }

    @Override
    public List<PlayerMatchSummary> findAllPlayersByMatchCount(Long clanId, LocalDateTime start, LocalDateTime end) {
        return em.createQuery("""
            SELECT new com.example.roflparser.dto.projection.PlayerMatchSummary(
                p.riotIdGameName,
                COUNT(m.id)
            )
            FROM Match m
            JOIN m.participants mp
            JOIN mp.player p
            WHERE p.clan.id = :clanId
              AND m.gameDatetime BETWEEN :start AND :end
            GROUP BY p.riotIdGameName
            ORDER BY COUNT(m.id) DESC
        """, PlayerMatchSummary.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
}
