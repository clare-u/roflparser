package com.example.roflparser.repository;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {
    // 특정 플레이어의 모든 경기 - MatchId순 정렬
    List<MatchParticipant> findAllByPlayerOrderByMatch_MatchIdDesc(Player player);
    List<MatchParticipant> findAllByPlayerOrderByMatch_MatchIdAsc(Player player);

    // 전체 참가자 레코드 - 최신순 정렬
    List<MatchParticipant> findAllByOrderByMatch_GameDatetimeDesc();

    // 전체 참가자 레코드 - 오래된순 정렬
    List<MatchParticipant> findAllByOrderByMatch_GameDatetimeAsc();

    // 특정 경기의 모든 참가자
    List<MatchParticipant> findAllByMatch(Match match);

    // clan 별로 경기 가져오기
    @Query("SELECT DISTINCT mp.match.id FROM MatchParticipant mp WHERE mp.player.clan.id = :clanId")
    List<Long> findDistinctMatchIdsByPlayerClanId(@Param("clanId") Long clanId);

}
