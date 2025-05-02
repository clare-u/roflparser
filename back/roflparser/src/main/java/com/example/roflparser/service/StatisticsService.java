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

import java.time.LocalDateTime;
import java.time.YearMonth;
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
        List<ChampionStatisticsResponse.ChampionScoreDto> tier1 = mapToTierChampions(allStats, true);
        List<ChampionStatisticsResponse.ChampionScoreDto> tier5 = mapToTierChampions(allStats, false);

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
     * 인기 챔피언: 판수 기준으로 내림차순 정렬
     */
    private List<ChampionStatisticsResponse.ChampionStatDto> mapToPopularChampions(List<ChampionStat> stats) {
        return stats.stream()
                .sorted(Comparator.comparingLong(ChampionStat::getMatches).reversed())
                .limit(20)
                .map(s -> ChampionStatisticsResponse.ChampionStatDto.builder()
                        .name(s.getChampion())
                        .matches((int) s.getMatches())
                        .wins((int) s.getWins())
                        .losses((int) s.getLosses())
                        .winRate(s.getWinRate())
                        .build())
                .toList();
    }

    /**
     * 1티어 / 5티어 챔피언 계산
     * - 승률과 픽률 기반 score 계산
     * - 5판 이상 사용된 챔피언만 포함
     * - 1티어: score 높은 순 / 5티어: 낮은 순
     * - 중복 제거: 상위/하위 챔피언 그룹이 겹치지 않게 필터링
     */
    private List<ChampionStatisticsResponse.ChampionScoreDto> mapToTierChampions(List<ChampionStat> stats, boolean highTier) {
        List<ChampionStatisticsResponse.ChampionScoreDto> scored = stats.stream()
                .filter(s -> s.getMatches() >= 5)
                .map(s -> {
                    double pickRate = s.getPickRate(); // 이건 ChampionStat 클래스에 전체 판수 대비 계산되어 있어야 함
                    double score = s.getWinRate() * 0.7 + pickRate * 0.3;
                    return ChampionStatisticsResponse.ChampionScoreDto.builder()
                            .name(s.getChampion())
                            .matches((int) s.getMatches())
                            .wins((int) s.getWins())
                            .losses((int) s.getLosses())
                            .winRate(s.getWinRate())
                            .pickRate(pickRate)
                            .score(score)
                            .build();
                })
                .sorted(Comparator.comparingDouble(ChampionStatisticsResponse.ChampionScoreDto::getScore)
                        .reversed()
                        .thenComparing(ChampionStatisticsResponse.ChampionScoreDto::getName))
                .toList();

        // 점수 정렬된 리스트에서 상위 또는 하위 20개 추출
        List<ChampionStatisticsResponse.ChampionScoreDto> tierList = highTier
                ? scored.stream().limit(20).toList()
                : scored.stream().sorted(Comparator.comparingDouble(ChampionStatisticsResponse.ChampionScoreDto::getScore)).limit(20).toList();

        // 상호 중복 제거: tier1과 tier5에서 겹치는 챔피언 제거
        Set<String> exclude = tierList.stream().map(ChampionStatisticsResponse.ChampionScoreDto::getName).collect(Collectors.toSet());
        return scored.stream()
                .filter(c -> !exclude.contains(c.getName()))
                .limit(20)
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


