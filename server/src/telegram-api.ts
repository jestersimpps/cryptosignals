const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = "1484464165:AAFc6u5N9eG_t49aOc0ZiAilsJH5VhdwPcg";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export const onUserText = (regExg: RegExp, method: (response?: string) => void) => {
  bot.onText(regExg, (msg, match) => method(msg));
};

export const sendPrivateTelegramMessage = (telegramChatId: string, message: string) => {
  bot.sendMessage(telegramChatId, message);
};
