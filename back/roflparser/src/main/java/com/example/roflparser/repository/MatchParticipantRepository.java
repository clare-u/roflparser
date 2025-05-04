package com.example.roflparser.repository;

import com.example.roflparser.domain.Match;
import com.example.roflparser.domain.MatchParticipant;
import com.example.roflparser.domain.Player;
import com.example.roflparser.repository.custom.MatchParticipantRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long>, MatchParticipantRepositoryCustom {

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

    /**
     * 플레이어 닉네임 병합 시 사용.
     * 기존 플레이어(fromId)의 모든 MatchParticipant 전적을 새 플레이어(toId)로 이전합니다.
     *
     * - 사용 예: 닉네임 변경 시 동일한 닉네임이 이미 존재할 경우 전적 이관
     * - 주의: MatchParticipant의 player FK만 변경되며, oldPlayer 엔티티는 삭제 또는 soft delete 처리 필요
     */
    @Modifying
    @Query("UPDATE MatchParticipant mp SET mp.player.id = :toId WHERE mp.player.id = :fromId")
    void updatePlayerId(@Param("fromId") Long fromId, @Param("toId") Long toId);

}
