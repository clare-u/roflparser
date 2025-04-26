package com.example.roflparser.repository;

import com.example.roflparser.domain.TierLineScore;
import com.example.roflparser.domain.TierLineScoreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TierLineScoreRepository extends JpaRepository<TierLineScore, TierLineScoreId> {

    // 기본 findAll(), findById() 모두 사용 가능
    // 필요 시 추가 메서드 작성 가능 (예: 티어명으로 검색 등)
}
