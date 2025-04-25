import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

dotenv.config(); // .env 파일 로드

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

client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong!");
  }
});

client.login(token);
