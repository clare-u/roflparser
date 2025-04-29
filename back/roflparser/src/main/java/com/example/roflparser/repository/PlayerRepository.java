package com.example.roflparser.repository;

import com.example.roflparser.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    Optional<Player> findByRiotIdGameNameAndRiotIdTagLine(String riotIdGameName, String riotIdTagLine);
    List<Player> findAllByRiotIdGameName(String riotIdGameName);

    // 경기 참여한 모든 플레이어 조회 (참여 경기 많은 순)
    @Query("""
    SELECT p 
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    GROUP BY p
    ORDER BY COUNT(mp) DESC
    """)
    List<Player> findAllHasMatchesOrderByMatchCountDesc();

    // 닉네임으로 필터한 플레이어 조회 (참여 경기 많은 순)
    @Query("""
    SELECT p 
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    WHERE p.riotIdGameName = :riotIdGameName
    GROUP BY p
    ORDER BY COUNT(mp) DESC
    """)
    List<Player> findAllByRiotIdGameNameHasMatchesOrderByMatchCountDesc(@Param("riotIdGameName") String riotIdGameName);

    // (추가) 클랜 ID로 모든 플레이어 조회 (참여 경기 많은 순)
    @Query("""
    SELECT p
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    WHERE p.clan.id = :clanId
    GROUP BY p
    ORDER BY COUNT(mp) DESC
    """)
    List<Player> findAllByClanIdHasMatchesOrderByMatchCountDesc(@Param("clanId") Long clanId);

    // (추가) 클랜 ID + 닉네임으로 플레이어 조회 (참여 경기 많은 순)
    @Query("""
    SELECT p
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    WHERE p.clan.id = :clanId
    AND p.riotIdGameName = :riotIdGameName
    GROUP BY p
    ORDER BY COUNT(mp) DESC
    """)
    List<Player> findAllByRiotIdGameNameAndClanIdHasMatchesOrderByMatchCountDesc(
            @Param("riotIdGameName") String riotIdGameName,
            @Param("clanId") Long clanId
    );

    // 닉네임 검색 시 대소문자 구분 무시
    @Query("""
    SELECT p
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    WHERE LOWER(p.riotIdGameName) = LOWER(:riotIdGameName) AND p.clan.id = :clanId
    GROUP BY p
    ORDER BY COUNT(mp) DESC
    """)
    List<Player> findAllByRiotIdGameNameIgnoreCaseAndClanIdHasMatchesOrderByMatchCountDesc(@Param("riotIdGameName") String riotIdGameName, @Param("clanId") Long clanId);
    }
