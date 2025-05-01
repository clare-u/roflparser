import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
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

client.once("ready", async () => {
  await loadChampionMap();
  console.log("봇이 준비되었습니다!");
});

// 챔피언 한글 이름 매핑
let championNameMap = {};
const CHAMPION_KEY_EXCEPTIONS = {
  FiddleSticks: "Fiddlesticks",
}; // 피들스틱 예외처리

const loadChampionMap = async () => {
  try {
    const versionRes = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const latestVersion = versionRes.data[0];

    const champRes = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
    );

    const raw = champRes.data.data;
    championNameMap = {};

    for (const key in raw) {
      championNameMap[key] = raw[key].name; // 예: Sett → 세트
    }

    console.log("✅ 챔피언 한글 이름 로딩 완료");
  } catch (error) {
    console.error("❌ 챔피언 이름 로딩 실패:", error);
  }
};

const getKoreanChampionName = (key) => {
  const correctedKey = CHAMPION_KEY_EXCEPTIONS[key] || key;
  return championNameMap[correctedKey] || key;
};

// !명령어
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!명령어") {
    message.reply(
      "**명령어 목록**\n" +
        "`!최근` - 최근 5경기 요약 보기\n" +
        "`!링크` - 사이트 링크 받기\n" +
        "`!전적` - 디스코드 닉네임으로 검색하여 플레이어 요약 정보 보기\n" +
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
                return `**${nameTag}** ${getKoreanChampionName(p.champion)} (${
                  p.kills
                }/${p.deaths}/${p.assists})`;
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

// !전적 닉네임 or !전적
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
    .setTitle(`🔎 ${gameName} #${tagLine}`)
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
                `${
                  m.win ? ":blue_circle:" : ":red_circle:"
                } ${getKoreanChampionName(m.champion)} ${m.kills}/${m.deaths}/${
                  m.assists
                }`
            )
            .join("\n") || "최근 경기 없음",
        inline: true,
      },
      {
        name: "팀워크💙",
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
        inline: true,
      },
      {
        name: "팀워크💔",
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
        inline: true,
      },
      {
        name: "🌟 모스트픽 10",
        value:
          mostPlayedChampions.length > 0
            ? mostPlayedChampions
                .map(
                  (c) =>
                    `${getKoreanChampionName(c.champion)}: ${
                      c.matches
                    }판 ${c.winRate.toFixed(2)}% KDA: ${c.kda.toFixed(2)}`
                )
                .join("\n")
            : "데이터 없음",
        inline: true,
      },
      {
        name: "맞라인👍",
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
        inline: true,
      },
      {
        name: "맞라인👎",
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
        inline: true,
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

// 리플레이 파일 업로드(코드클랜)
client.on("messageCreate", async (message) => {
  // 봇이 보낸 메시지는 무시
  if (message.author.bot) return;

  // 특정 채널에서만 작동
  if (message.channel.id !== "123456789012345678" || "1365246914706149387")
    return;

  // 첨부파일이 없으면 무시
  if (!message.attachments.size) return;

  for (const attachment of message.attachments.values()) {
    const fileName = attachment.name || "";
    const url = attachment.url;

    // 파일명 검증: code_0501_2015.rofl 형식
    if (!/^code_\d{4}_\d{4}\.rofl$/.test(fileName)) continue;

    try {
      // 파일 다운로드
      await message.reply("✋ 파일 다운로드 중...");

      const response = await axios.get(url, { responseType: "stream" });

      const form = new FormData();
      form.append("file", response.data, fileName);

      const host = GUILD_HOST_MAP[message.guild?.id || ""] || "lolcode.kro.kr";

      const uploadRes = await axios.post(
        "https://roflbot.kro.kr/api/rofl/upload/code",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Host: host,
          },
        }
      );

      await message.reply("✅ 전적 등록 성공!");
    } catch (error) {
      console.error("리플레이 업로드 실패:", error);

      // 에러 메시지 추출 (AxiosError 타입이면 response.data 등에서 더 얻을 수도 있음)
      const errorMsg =
        error.response?.data?.message || error.message || "알 수 없는 오류";

      await message.reply(
        `❌ 업로드 중 오류가 발생했습니다.\n\`\`\`${errorMsg}\`\`\``
      );
    }
  }
});

client.login(token);
