// telegramBot.js
const { Telegraf } = require("telegraf");

const BOT_ID = process.env.BOT_ID;
const bot = new Telegraf(BOT_ID, { polling: true });

module.exports = bot;
