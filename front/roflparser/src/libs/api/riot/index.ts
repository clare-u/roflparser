// riotAccount.ts

import { handleRiotApiRequest, RIOT_API_SERVERS } from "../riotApi";

/**
 * PUUID를 이용해 계정 정보 조회
 * @param puuid Riot PUUID
 * @returns Riot 계정 정보
 */
export const getAccountByPuuid = async (puuid: string) => {
  const endpoint = `/riot/account/v1/accounts/by-puuid/${puuid}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};

/**
 * [ESPORTS] PUUID를 이용해 계정 정보 조회
 * @param puuid Riot PUUID
 * @returns Riot 계정 정보 (eSports 플랫폼)
 */
export const getAccountByPuuidEsports = async (puuid: string) => {
  const endpoint = `/riot/account/v1/accounts/by-puuid/${puuid}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};

/**
 * 게임명과 태그라인으로 계정 정보 조회
 * @param gameName Riot ID (e.g., "Faker")
 * @param tagLine 태그라인 (e.g., "KR1")
 * @returns Riot 계정 정보
 */
export const getAccountByRiotId = async (gameName: string, tagLine: string) => {
  const endpoint = `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};

/**
 * [ESPORTS] 게임명과 태그라인으로 계정 정보 조회
 * @param gameName Riot ID (e.g., "Faker")
 * @param tagLine 태그라인 (e.g., "KR1")
 * @returns Riot 계정 정보 (eSports 플랫폼)
 */
export const getAccountByRiotIdEsports = async (
  gameName: string,
  tagLine: string
) => {
  const endpoint = `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};

/**
 * 특정 게임에서 주어진 PUUID에 대한 활성 샤드 정보 조회
 * @param game 게임명 (예: "val" = Valorant, "lor" = Legends of Runeterra)
 * @param puuid Riot PUUID
 * @returns 해당 유저의 게임 서버 샤드 정보
 */
export const getActiveShardByGameAndPuuid = async (
  game: string,
  puuid: string
) => {
  const endpoint = `/riot/account/v1/active-shards/by-game/${game}/by-puuid/${puuid}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};
/**
 * PUUID를 이용해 최근 매치 ID 리스트 조회
 * @param puuid Riot PUUID
 * @param start 시작 인덱스 (기본: 0)
 * @param count 가져올 경기 수 (기본: 10)
 * @returns Match ID 리스트 (문자열 배열)
 */

export const getMatchIdsByPuuid = async (
  puuid: string,
  start = 0,
  count = 10
) => {
  const endpoint = `/lol/match/v5/matches/by-puuid/${encodeURIComponent(
    puuid
  )}/ids?start=${start}&count=${count}`;

  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};

/**
 * matchId를 이용해 경기 상세 정보 조회
 * @param matchId Match ID 문자열
 * @returns 경기 상세 정보 (JSON)
 */
export const getMatchById = async (matchId: string) => {
  const endpoint = `/lol/match/v5/matches/${matchId}`;
  return await handleRiotApiRequest(endpoint, RIOT_API_SERVERS.REGIONAL);
};
