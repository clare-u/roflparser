package com.example.roflparser.service;

import com.example.roflparser.domain.TierLineScore;
import com.example.roflparser.domain.type.Position;
import com.example.roflparser.repository.TierLineScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final TierLineScoreRepository tierLineScoreRepository;

    /**
     * 전체 티어-포지션별 기본 점수 조회
     */
    public Map<String, Map<Position, Double>> getAllTierLineScores() {
        List<TierLineScore> scores = tierLineScoreRepository.findAll();

        // 1. tierName별로 묶기 + tierOrder도 함께 기억
        Map<String, List<TierLineScore>> grouped = scores.stream()
                .collect(Collectors.groupingBy(TierLineScore::getTierName));

        // 2. tierName -> tierOrder 매핑
        Map<String, Integer> tierOrderMap = scores.stream()
                .collect(Collectors.toMap(
                        TierLineScore::getTierName,
                        TierLineScore::getTierOrder,
                        (existing, replacement) -> existing // 중복 무시 (어차피 동일 tier_name이면 order도 같음)
                ));

        // 3. tierOrder 순서로 정렬해서 Map 만들기
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey((t1, t2) -> {
                    Integer order1 = tierOrderMap.get(t1);
                    Integer order2 = tierOrderMap.get(t2);
                    return order1.compareTo(order2);
                }))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            Map<Position, Double> ordered = new LinkedHashMap<>();
                            for (Position position : Position.values()) {
                                entry.getValue().stream()
                                        .filter(t -> t.getPosition() == position)
                                        .findFirst()
                                        .ifPresent(t -> ordered.put(position, t.getScore()));
                            }
                            return ordered;
                        },
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new // 중요! 순서를 유지하려면 LinkedHashMap 써야 해
                ));
    }


}
