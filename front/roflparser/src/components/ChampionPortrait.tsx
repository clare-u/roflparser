import { useLatestLolVersion } from "@/hooks";
import Loading from "./loading/Loading";

interface ChampionPortraitProps {
  championId: string;
  nameMap: Record<string, string>;
}

const ChampionPortrait: React.FC<ChampionPortraitProps> = ({
  championId,
  nameMap,
}) => {
  const { data: version, isLoading, error } = useLatestLolVersion();

  if (isLoading) return <Loading />;
  if (error || !version) return <div>버전 불러오기 실패</div>;

  // 피들스틱 예외 처리용 매핑
  const correctedId =
    championId === "FiddleSticks" ? "Fiddlesticks" : championId;

  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${correctedId}.png`;
  const koreanName = nameMap?.[correctedId] || correctedId;

  return (
    <img
      src={imageUrl}
      alt={koreanName}
      title={koreanName}
      className="w-10 h-10 border-1 border-black"
      style={{ boxShadow: "0 0 0 0.5px gray" }}
    />
  );
};
export default ChampionPortrait;
