import { useEffect, useState } from "react";
import axios from "axios";

export type ChampionNameMap = Record<string, string>;

export const useChampionMap = () => {
  const [map, setMap] = useState<ChampionNameMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // 최신 버전 가져오기
        const versionRes = await axios.get<string[]>(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const latestVersion = versionRes.data[0];

        // 한글 챔피언 데이터 가져오기
        const champRes = await axios.get(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
        );

        const raw = champRes.data.data;
        const nameMap: ChampionNameMap = {};

        for (const key in raw) {
          nameMap[key] = raw[key].name; // 예: Sett → 세트
        }

        setMap(nameMap);
      } catch (err) {
        console.error("챔피언 이름 불러오기 실패", err);
        setError("챔피언 이름을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChampionMap();
  }, []);

  return { championMap: map, loading, error };
};
