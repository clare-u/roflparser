import dotenv from "dotenv";
import axios from "axios";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

dotenv.config();
const token = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("봇이 준비되었습니다!");
});

// !명령어
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!명령어") {
    message.reply(
      "**명령어 목록**\n" +
        "`!최근` - 최근 5경기 요약 보기\n" +
        "`!링크` - 사이트 링크 받기\n" +
        "`!전적 <닉네임>` - 플레이어 요약 정보 보기"
    );
  }
});

// 코딩용 서버정보
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!서버정보") {
    message.reply(
      `서버 이름: ${message.guild?.name}\n서버 ID: ${message.guild?.id}`
    );
  }
});

// 서버 이름과 ID를 매핑
const SERVER = {
  roflbot: "399480345239486478",
  lolcode: "123456789012345678", // 예시
};

// 서버별로 Host 헤더를 다르게 적용하기 위한 매핑
const GUILD_HOST_MAP = {
  "399480345239486478": "roflbot.kro.kr",
  "123456789012345678": "lolcode.kro.kr", // 예시
};

// !링크
// 서버 ID별 링크 설정
const SERVER_LINK = {
  [SERVER.roflbot]: "https://roflbot.kro.kr",
  [SERVER.lolcode]: "https://lolcode.kro.kr",
};

client.on("messageCreate", (message) => {
  if (message.content === "!링크") {
    const guildId = message.guild?.id;

    const link = SERVER_LINK[guildId || ""];
    if (link) {
      message.reply(link);
    } else {
      message.reply("이 서버에 맞는 링크가 설정되지 않았습니다.");
    }
  }
});

// !최근
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!최근") {
    const guildId = message.guild?.id;
    const host = GUILD_HOST_MAP[guildId] || "roflbot.kro.kr"; // 기본 호스트

    try {
      const res = await axios.get("https://roflbot.kro.kr/api/matches", {
        headers: {
          Host: host,
        },
      });
      const matches = res.data;

      if (Array.isArray(matches) && matches.length > 0) {
        const recent5 = matches.slice(0, 5);

        const embed = new EmbedBuilder()
          .setTitle("최근 5경기 전적 요약")
          .setColor("#7d9beb");

        for (const match of recent5) {
          const date = new Date(match.gameDatetime).toLocaleString("ko-KR");
          const lengthMin = Math.floor(match.gameLength / 60000);
          const lengthSec = Math.floor((match.gameLength % 60000) / 1000);

          const blueTeam = match.players.filter((p) => p.team === "100");
          const redTeam = match.players.filter((p) => p.team === "200");

          const blueWin = blueTeam[0]?.win;
          const redWin = redTeam[0]?.win;

          const formatTeam = (team) =>
            team
              .map((p) => {
                const nameTag = `${p.riotIdGameName} #${p.riotIdTagLine}`;
                return `**${nameTag}** ${p.champion} (${p.kills}/${p.deaths}/${p.assists})`;
              })
              .join("\n");

          embed.addFields(
            {
              name: ` `,
              value: `📅 ${date} • ⏱️ ${lengthMin}분 ${lengthSec}초`,
            },
            {
              name: `🟦 블루팀 ${blueWin ? "🏆승리🏆" : "✖️패배✖️"}`,
              value: formatTeam(blueTeam),
              inline: true,
            },
            {
              name: `🟥 레드팀 ${redWin ? "🏆승리🏆" : "✖️패배✖️"}`,
              value: formatTeam(redTeam),
              inline: true,
            }
          );
        }

        await message.channel.send({ embeds: [embed] });
      } else {
        message.reply("전적 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      message.reply("전적 정보를 가져오는데 실패했습니다.");
    }
  }
});

// !전적 닉네임
const buildPlayerStatsEmbed = (playerData) => {
  if (message.author.bot) return;

  const { gameName, tagLine, summary, byChampion, byPosition } = playerData;

  const embed = new EmbedBuilder()
    .setTitle(`🔎 ${gameName} #${tagLine} 전적 요약`)
    .setColor("#7d9beb")
    .setDescription(
      `총 ${summary.matches}판 (${summary.wins}승 ${summary.losses}패)\n` +
        `평균 KDA: ${summary.kda.toFixed(2)}`
    );

  // 챔피언별 통계
  const championStats = Object.entries(byChampion)
    .map(
      ([champion, stats]) =>
        `**${champion}**: ${stats.matches}판 ${stats.wins}승 ${
          stats.losses
        }패 (KDA ${stats.kda.toFixed(2)})`
    )
    .join("\n");

  embed.addFields({
    name: "🏆 챔피언별 전적",
    value: championStats || "데이터 없음",
  });

  // 포지션별 통계
  const positionStats = Object.entries(byPosition)
    .map(
      ([position, stats]) =>
        `**${position}**: ${stats.matches}판 ${stats.wins}승 ${
          stats.losses
        }패 (KDA ${stats.kda.toFixed(2)})`
    )
    .join("\n");

  embed.addFields({
    name: "🧭 포지션별 전적",
    value: positionStats || "데이터 없음",
  });

  // 최근 5전 전적
  const recentMatches = playerData.matches.slice(0, 5); // 최근 5경기
  const recentResults = recentMatches
    .map((m) => {
      const player = m.match.players.find(
        (p) =>
          p.riotIdGameName === playerData.gameName &&
          p.riotIdTagLine === playerData.tagLine
      );

      if (!player) return "❓ 데이터 없음";

      const resultEmoji = player.win ? "🏆승리🏆" : "✖️패배✖️";
      return `${resultEmoji} ${player.position} - ${player.champion} (${player.kills}/${player.deaths}/${player.assists})`;
    })
    .join("\n");

  embed.addFields({
    name: "🕹️ 최근 5경기 상세",
    value: recentResults || "데이터 없음",
  });

  return embed;
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!전적")) {
    const args = message.content.split(" ");
    const nickname = args.slice(1).join(" ");

    if (!nickname) {
      return message.reply("닉네임을 입력해주세요! 예: `!전적 Waterflower`");
    }

    try {
      const guildId = message.guild?.id;
      const host = GUILD_HOST_MAP[guildId] || "roflbot.kro.kr";

      const res = await axios.get(
        `https://roflbot.kro.kr/api/matches/player?nickname=${encodeURIComponent(
          nickname
        )}`,
        {
          headers: {
            Host: host,
          },
        }
      );

      const playerData = res.data[0];

      if (!playerData) {
        return message.reply(`'${nickname}'님의 전적 정보를 찾을 수 없습니다.`);
      }

      const embed = buildPlayerStatsEmbed(playerData);
      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("API 요청 실패:", error);
      message.reply("전적 정보를 가져오는 중 오류가 발생했습니다.");
    }
  }
});

client.login(token);
