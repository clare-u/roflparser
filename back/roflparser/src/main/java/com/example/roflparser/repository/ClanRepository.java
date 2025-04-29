package com.example.roflparser.repository;

import com.example.roflparser.domain.Clan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClanRepository extends JpaRepository<Clan, Long> {
}
