interface ChampionPortraitProps {
  championId: string;
  nameMap: Record<string, string>;
}

const ChampionPortrait: React.FC<ChampionPortraitProps> = ({
  championId,
  nameMap,
}) => {
  const version = "15.8.1"; // 또는 외부에서 props로 넘기기
  const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
  const koreanName = nameMap?.[championId] || championId;

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
