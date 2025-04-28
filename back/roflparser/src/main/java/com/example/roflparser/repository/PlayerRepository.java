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

    @Query("""
    SELECT p 
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    GROUP BY p
    ORDER BY COUNT(mp) DESC
""")
    List<Player> findAllHasMatchesOrderByMatchCountDesc();

    @Query("""
    SELECT p 
    FROM Player p
    JOIN MatchParticipant mp ON mp.player = p
    WHERE p.riotIdGameName = :riotIdGameName
    GROUP BY p
    ORDER BY COUNT(mp) DESC
""")
    List<Player> findAllByRiotIdGameNameHasMatchesOrderByMatchCountDesc(@Param("riotIdGameName") String riotIdGameName);


}
