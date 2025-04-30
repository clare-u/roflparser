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
  const {
    gameName,
    tagLine,
    summary,
    monthlyStats,
    byChampion,
    byPosition,
    recentMatches,
    mostPlayedChampions,
    bestTeamwork,
    worstTeamwork,
    bestLaneOpponents,
    worstLaneOpponents,
  } = playerData;

  const embed = new EmbedBuilder()
    .setTitle(`🔎 ${gameName} #${tagLine} 전적 요약`)
    .setColor("#7d9beb")
    .addFields(
      {
        name: "📆 이번달 전적",
        value: `${monthlyStats.wins}승 / ${monthlyStats.winRate.toFixed(
          2
        )}% KDA: ${monthlyStats.kda.toFixed(2)}`,
        inline: false,
      },
      {
        name: "📊 통합 전적",
        value: `${summary.matches}전 ${
          summary.wins
        }승 / ${summary.winRate.toFixed(2)}%`,
        inline: false,
      },
      {
        name: "🧭 포지션별 전적",
        value:
          Object.entries(byPosition)
            .map(
              ([position, stats]) =>
                `**${position}**: ${stats.matches}판 ${stats.wins}승 ${
                  stats.losses
                }패 (KDA ${stats.kda.toFixed(2)})`
            )
            .join("\n") || "데이터 없음",
        inline: false,
      },
      {
        name: "🏹 최근 10경기",
        value:
          recentMatches
            .map(
              (m) =>
                `${m.win ? ":blue_circle:" : ":red_circle:"} ${m.champion} ${
                  m.kills
                }/${m.deaths}/${m.assists}`
            )
            .join("\n") || "최근 경기 없음",
        inline: false,
      },
      {
        name: "👥 팀워크 좋은 팀원",
        value:
          bestTeamwork.length > 0
            ? bestTeamwork
                .map(
                  (t) =>
                    `${t.gameName}: ${t.wins}승/${
                      t.losses
                    }패 ${t.winRate.toFixed(2)}%`
                )
                .join("\n")
            : "데이터 없음",
        inline: false,
      },
      {
        name: "💔 팀워크 안 좋은 팀원",
        value:
          worstTeamwork.length > 0
            ? worstTeamwork
                .map(
                  (t) =>
                    `${t.gameName}: ${t.wins}승/${
                      t.losses
                    }패 ${t.winRate.toFixed(2)}%`
                )
                .join("\n")
            : "데이터 없음",
        inline: false,
      },
      {
        name: "🌟 모스트픽 챔피언",
        value:
          mostPlayedChampions.length > 0
            ? mostPlayedChampions
                .map(
                  (c) =>
                    `${c.champion}: ${c.matches}판 ${c.winRate.toFixed(
                      2
                    )}% KDA: ${c.kda.toFixed(2)}`
                )
                .join("\n")
            : "데이터 없음",
        inline: false,
      },
      {
        name: "🧠 맞라인 강한 상대",
        value:
          bestLaneOpponents.length > 0
            ? bestLaneOpponents
                .map(
                  (o) =>
                    `${o.gameName}: ${o.wins}승/${
                      o.losses
                    }패 ${o.winRate.toFixed(2)}%`
                )
                .join("\n")
            : "데이터 없음",
        inline: false,
      },
      {
        name: "😱 맞라인 약한 상대",
        value:
          worstLaneOpponents.length > 0
            ? worstLaneOpponents
                .map(
                  (o) =>
                    `${o.gameName}: ${o.wins}승/${
                      o.losses
                    }패 ${o.winRate.toFixed(2)}%`
                )
                .join("\n")
            : "데이터 없음",
        inline: false,
      }
    );

  return embed;
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!전적")) return;

  const args = message.content.split(" ");
  let nickname = args.slice(1).join(" ").trim();

  // 닉네임이 명시되지 않은 경우 → 디스코드 닉네임에서 추출
  if (!nickname) {
    const rawName = message.member?.displayName || message.author.username;

    // "Code 닉네임 / 97" 또는 "닉네임 / 97" 또는 "닉네임"
    const match = rawName.match(/(?:Code\s)?(.+?)(?:\s*\/\s*\d{2})?$/);
    if (match && match[1]) {
      nickname = match[1].trim();
    } else {
      return message.reply("닉네임을 입력해주세요! 예: `!전적 Waterflower`");
    }
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
});

client.login(token);
