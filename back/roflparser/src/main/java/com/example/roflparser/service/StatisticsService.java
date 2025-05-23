package com.example.roflparser.service;

import com.example.roflparser.dto.projection.ChampionStat;
import com.example.roflparser.dto.projection.PlayerMatchSummary;
import com.example.roflparser.dto.projection.PlayerWinRateSummary;
import com.example.roflparser.dto.response.ChampionStatisticsResponse;
import com.example.roflparser.dto.response.ClanStatisticsResponse;
import com.example.roflparser.dto.response.PlayerStatisticsResponse;
import com.example.roflparser.repository.MatchParticipantRepository;
import com.example.roflparser.repository.MatchRepository;
import com.example.roflparser.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.roflparser.dto.response.ChampionStatisticsResponse.ChampionScoreDto;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository participantRepository;
    private final PlayerRepository playerRepository;

    /**
     * 월별 챔피언 통계 조회
     * - 인기 챔피언, 1티어 챔피언, 5티어 챔피언
     */
    public ChampionStatisticsResponse getChampionStatistics(String month, String origin) {
        Long clanId = determineClanIdFromOrigin(origin);
        LocalDateTime[] range = getMonthRange(month);

        // 해당 클랜, 월의 모든 챔피언 통계 가져오기
        List<ChampionStat> allStats = participantRepository.findChampionStatsByClanAndMonth(clanId, range[0], range[1]);

        // 각각 응답용 DTO로 매핑
        List<ChampionStatisticsResponse.ChampionStatDto> popular = mapToPopularChampions(allStats);
        List<ChampionScoreDto> scoredHigh = mapToTierChampions(allStats, true);
        List<ChampionScoreDto> scoredLow = mapToTierChampions(allStats, false);

        Set<String> tier1Names = scoredHigh.stream()
                .limit(20)
                .map(ChampionScoreDto::getName)
                .collect(Collectors.toSet());

        List<ChampionScoreDto> tier1 = scoredHigh.stream()
                .limit(20)
                .toList();

        List<ChampionScoreDto> tier5 = scoredLow.stream()
                .filter(c -> !tier1Names.contains(c.getName())) // 중복 제거 로직
                .limit(20)
                .toList();

        return ChampionStatisticsResponse.builder()
                .popularChampions(popular)
                .tier1Champions(tier1)
                .tier5Champions(tier5)
                .build();
    }

    /**
     * 월별 플레이어 통계 조회
     * - 매치수 상위 20, 승률 상위 20, 1/5티어 챔피언 포함
     */
    public PlayerStatisticsResponse getPlayerStatistics(String month, String origin) {
        Long clanId = determineClanIdFromOrigin(origin);
        LocalDateTime[] range = getMonthRange(month);

        List<PlayerMatchSummary> matchCounts = playerRepository.findTopPlayersByMatchCount(clanId, range[0], range[1]);
        List<PlayerWinRateSummary> winRates = playerRepository.findTopPlayersByWinRate(clanId, range[0], range[1]);

        List<ChampionStat> allStats = participantRepository.findChampionStatsByClanAndMonth(clanId, range[0], range[1]);
        List<ChampionStatisticsResponse.ChampionScoreDto> tier1 = mapToTierChampions(allStats, true);
        List<ChampionStatisticsResponse.ChampionScoreDto> tier5 = mapToTierChampions(allStats, false);

        return PlayerStatisticsResponse.builder()
                .topByMatches(mapToMatchCountDto(matchCounts))
                .topByWinRate(mapToWinRateDto(winRates))
                .tier1Champions(tier1)
                .tier5Champions(tier5)
                .build();
    }

    /**
     * 월별 클랜 전체 플레이어 전적 조회
     * - 1판 이상 플레이한 유저 전체 목록
     */
    public ClanStatisticsResponse getClanStatistics(String month, String origin) {
        Long clanId = determineClanIdFromOrigin(origin);
        LocalDateTime[] range = getMonthRange(month);

        List<PlayerMatchSummary> summaries = playerRepository.findAllPlayersByMatchCount(clanId, range[0], range[1]);

        return ClanStatisticsResponse.builder()
                .players(mapToClanPlayerDto(summaries))
                .build();
    }

    /**
     * 해당 월에 대한 시작일과 종료일 범위 계산
     */
    private LocalDateTime[] getMonthRange(String month) {
        YearMonth ym = YearMonth.parse(month);
        return new LocalDateTime[] {
                ym.atDay(1).atStartOfDay(),
                ym.atEndOfMonth().atTime(23, 59, 59)
        };
    }

    /**
     * Origin 헤더 기반으로 클랜 ID 결정
     */
    private Long determineClanIdFromOrigin(String origin) {
        if (origin == null) return 1L;
        if (origin.contains("roflbot.kro.kr")) return 1L;
        if (origin.contains("lolcode.kro.kr")) return 2L;
        return 1L;
    }

    /**
     * 인기 챔피언: 판수 기준, 승률 높은순으로 내림차순 정렬
     */
    private List<ChampionStatisticsResponse.ChampionStatDto> mapToPopularChampions(List<ChampionStat> stats) {
        System.out.println("=== Sorted Result Preview ===");
        return stats.stream()
                .sorted(
                        Comparator.comparingLong(ChampionStat::getMatches).reversed()
                                .thenComparing(Comparator.comparingDouble(ChampionStat::getWinRate).reversed())
                )
                .limit(20)
                .map(stat -> ChampionStatisticsResponse.ChampionStatDto.builder()
                        .name(stat.getChampion())
                        .matches(stat.getMatches())
                        .wins(stat.getWins())
                        .losses(stat.getLosses())
                        .winRate(stat.getWinRate())
                        .build())
                .toList();
    }

    /**
     * 1티어 / 5티어 챔피언 계산
     * - 승률과 픽률 기반 score 계산
     * - 5판 이상 사용된 챔피언만 포함
     * - 1티어: score 높은 순 / 5티어: 낮은 순
     */
    private List<ChampionStatisticsResponse.ChampionScoreDto> mapToTierChampions(List<ChampionStat> stats, boolean highTier) {
        Comparator<ChampionScoreDto> comparator = Comparator
                .comparingDouble(ChampionScoreDto::getScore)
                .thenComparing(ChampionScoreDto::getName);

        if (highTier) {
            comparator = comparator.reversed();
        }

        return stats.stream()
                .filter(s -> s.getMatches() >= 5)
                .map(s -> {
                    double pickRate = s.getPickRate();
                    double score = s.getWinRate() * 0.7 + pickRate * 0.3;
                    return ChampionScoreDto.builder()
                            .name(s.getChampion())
                            .matches(s.getMatches())
                            .wins(s.getWins())
                            .losses(s.getLosses())
                            .winRate(s.getWinRate())
                            .pickRate(pickRate)
                            .score(score)
                            .build();
                })
                .sorted(comparator)
                .toList();
    }



    // ===================== DTO 매핑 ======================

    private List<PlayerStatisticsResponse.PlayerMatchCountDto> mapToMatchCountDto(List<PlayerMatchSummary> list) {
        return list.stream()
                .map(summary -> PlayerStatisticsResponse.PlayerMatchCountDto.builder()
                        .gameName(summary.getGameName())
                        .matches((int) summary.getMatches())
                        .build())
                .toList();
    }

    private List<PlayerStatisticsResponse.PlayerWinRateDto> mapToWinRateDto(List<PlayerWinRateSummary> list) {
        return list.stream()
                .map(summary -> PlayerStatisticsResponse.PlayerWinRateDto.builder()
                        .gameName(summary.getGameName())
                        .wins((int) summary.getWins())
                        .winRate(summary.getWinRate())
                        .kda(summary.getKDA())
                        .build())
                .toList();
    }

    private List<ClanStatisticsResponse.ClanPlayerDto> mapToClanPlayerDto(List<PlayerMatchSummary> list) {
        return list.stream()
                .map(summary -> ClanStatisticsResponse.ClanPlayerDto.builder()
                        .gameName(summary.getGameName())
                        .matches((int) summary.getMatches())
                        .build())
                .toList();
    }
}


