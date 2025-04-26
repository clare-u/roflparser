"use client";

import React from "react";
import { MatchSummary } from "@/types/rofl";
import { groupByTeam } from "@/utils/teamsort";
import { ChampionNameMap } from "@/hooks/riot/useChampionMap";
import ChampionPortrait from "./ChampionPortrait";
import Link from "next/link";

interface MatchCardProps {
  match: MatchSummary;
  win?: boolean; // 선택적: 내가 플레이한 입장에서의 승/패
  championMap: ChampionNameMap;
}

const formatGameLength = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const MatchCard: React.FC<MatchCardProps> = ({ match, win, championMap }) => {
  const { team100, team200 } = groupByTeam(match.players);

  const team100Win = team100[0]?.win ?? false;
  const team200Win = team200[0]?.win ?? false;

  const matchBgColor =
    win === true
      ? "bg-blue-100 text-blue-900"
      : win === false
      ? "bg-red-100 text-red-900"
      : "bg-white text-gray-800";

  const resultText = win === true ? "승리" : win === false ? "패배" : "";

  return (
    <div className={`border rounded-xl p-4 mb-4 shadow-lg ${matchBgColor}`}>
      <div className="mb-2 flex justify-between">
        <div className="font-semibold">
          KR-{match.matchId} ⏱{formatGameLength(match.gameLength)}
        </div>
        <div className="text-sm">
          업로드: {new Date(match.gameDatetime).toLocaleString()}
        </div>
      </div>

      {resultText && (
        <div className="font-semibold text-lg mb-2">
          <span>{resultText}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* 블루팀 */}
        <div>
          <h3
            className={`font-bold mb-2 ${
              team100Win ? "text-blue-600" : "text-gray-500"
            }`}
          >
            블루팀 - {team100Win ? "승리" : "패배"}
          </h3>
          <ul>
            {team100.map((player) => {
              const nickname = `${player.riotIdGameName}#${player.riotIdTagLine}`;
              const encodedNickname = encodeURIComponent(nickname);
              return (
                <li
                  key={player.riotIdGameName + player.riotIdTagLine}
                  className="mb-1 flex items-center gap-2"
                >
                  <ChampionPortrait
                    championId={player.champion}
                    nameMap={championMap}
                  />
                  <Link
                    href={`/${encodedNickname}`}
                    className="hover:underline text-black"
                  >
                    {player.riotIdGameName} #{player.riotIdTagLine}
                  </Link>
                  <span className="text-gray-600">
                    ({player.kills}/{player.deaths}/{player.assists})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 레드팀 */}
        <div>
          <h3
            className={`font-bold mb-2 ${
              team200Win ? "text-red-600" : "text-gray-500"
            }`}
          >
            레드팀 - {team200Win ? "승리" : "패배"}
          </h3>
          <ul>
            {team200.map((player) => {
              const nickname = `${player.riotIdGameName}#${player.riotIdTagLine}`;
              const encodedNickname = encodeURIComponent(nickname);
              return (
                <li
                  key={player.riotIdGameName + player.riotIdTagLine}
                  className="mb-1 flex items-center gap-2"
                >
                  <ChampionPortrait
                    championId={player.champion}
                    nameMap={championMap}
                  />
                  <Link
                    href={`/${encodedNickname}`}
                    className="hover:underline text-black"
                  >
                    {player.riotIdGameName} #{player.riotIdTagLine}
                  </Link>
                  <span className="text-gray-600">
                    ({player.kills}/{player.deaths}/{player.assists})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
