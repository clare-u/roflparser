package com.example.roflparser.repository;

import com.example.roflparser.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByRiotIdGameNameAndRiotIdTagLine(String riotIdGameName, String riotIdTagLine);
}
