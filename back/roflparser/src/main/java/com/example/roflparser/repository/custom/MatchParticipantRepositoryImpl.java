package com.example.roflparser.repository.custom;

import com.example.roflparser.dto.projection.ChampionStat;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class MatchParticipantRepositoryImpl implements MatchParticipantRepositoryCustom {

    private final EntityManager em;

    @Override
    public List<ChampionStat> findChampionStatsByClanAndMonth(Long clanId, LocalDateTime start, LocalDateTime end) {
        // 총 경기 수를 먼저 조회
        long totalGames = em.createQuery("""
        SELECT COUNT(DISTINCT m.id)
        FROM MatchParticipant mp
        JOIN mp.match m
        JOIN mp.player p
        WHERE p.clan.id = :clanId AND m.gameDatetime BETWEEN :start AND :end
    """, Long.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        // 챔피언 통계 + 픽률 계산 포함
        String jpql = """
        SELECT new com.example.roflparser.dto.projection.ChampionStat(
            mp.champion,
            COUNT(mp.id),
            SUM(CASE WHEN mp.win = true THEN 1 ELSE 0 END),
            SUM(CASE WHEN mp.win = false THEN 1 ELSE 0 END),
            COUNT(mp.id) * 1.0 / :totalGames * 100
        )
        FROM MatchParticipant mp
        JOIN mp.match m
        JOIN mp.player p
        WHERE p.clan.id = :clanId AND m.gameDatetime BETWEEN :start AND :end
        GROUP BY mp.champion
    """;

        return em.createQuery(jpql, ChampionStat.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("totalGames", totalGames)
                .getResultList();
    }

}
