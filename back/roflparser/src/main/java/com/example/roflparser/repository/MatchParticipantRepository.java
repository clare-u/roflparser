package com.example.roflparser.repository;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

    // 특정 플레이어의 모든 경기 - 최신순 정렬
    List<MatchParticipant> findAllByPlayerOrderByMatch_GameDatetimeDesc(Player player);

    // 특정 플레이어의 모든 경기 - 오래된순 정렬
    List<MatchParticipant> findAllByPlayerOrderByMatch_GameDatetimeAsc(Player player);

    // 전체 참가자 레코드 - 최신순 정렬
    List<MatchParticipant> findAllByOrderByMatch_GameDatetimeDesc();

    // 전체 참가자 레코드 - 오래된순 정렬
    List<MatchParticipant> findAllByOrderByMatch_GameDatetimeAsc();

    // 특정 경기의 모든 참가자
    List<MatchParticipant> findAllByMatch(Match match);
}
