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
        // 총 경기 수 (중복 제거된 Match 기준)
        Long totalGames = em.createQuery("""
            SELECT COUNT(DISTINCT m.id)
            FROM Match m
            JOIN m.participants mp
            JOIN mp.player p
            WHERE p.clan.id = :clanId AND m.gameDatetime BETWEEN :start AND :end
        """, Long.class)
                .setParameter("clanId", clanId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        if (totalGames == 0) {
            return List.of(); // 데이터가 없으면 빈 리스트 반환
        }

        // 챔피언별 통계 및 픽률 계산
        String jpql = """
            SELECT new com.example.roflparser.dto.projection.ChampionStat(
                mp.champion,
                COUNT(mp),
                SUM(CASE WHEN mp.win = true THEN 1 ELSE 0 END),
                SUM(CASE WHEN mp.win = false THEN 1 ELSE 0 END),
                (COUNT(mp) * 1.0 / :totalGames) * 100
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
