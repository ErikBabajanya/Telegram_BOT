const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");
const transactionModel = require("./schema/transaction.schema");
const TimeAgo = require("javascript-time-ago");
const hy = require("javascript-time-ago/locale/hy");
const ARMENIA_TIME = require("./util/armenian_time");
const fetchData = require("./gecko.transaction");
require("dotenv").config();

TimeAgo.addLocale(hy);

const BOT_ID = process.env.BOT_ID;
const bot = new Telegraf(BOT_ID);
const GROUPP_CHAT_ID = process.env.GROUPP_CHAT_ID;
const CURRENT_DATE = new Date();
const ATLAS_URL = process.env.ATLAS_URL;
const axios = require("axios");

async function mongo() {
  try {
    const connection = await mongoose.connect(ATLAS_URL);
    console.log(
      "MongoDB connection established:",
      connection.connection.readyState
    ); // Improved logging with connection state

    // Add logic to handle successful connection here (e.g., initialize your Telegram bot)
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);

    // Implement robust error handling here (e.g., retry logic, error notification)
  }
}

mongo();
const activeChatId = {};

async function sendNewTransaction(walletAddress) {
  console.log(11);
  try {
    const myWallet = await transactionModel.find({ wallet: walletAddress });
    console.log(myWallet);
    const wallet = myWallet[0];
    const lastTransactionDate =
      wallet.transactions[wallet.transactions.length - 1].date;
    if (new Date(lastTransactionDate) < CURRENT_DATE) {
      return;
    }
    console.log(wallet.wallet, 11);
    let x = "";
    let b = "";
    let s = "";
    console.log(wallet);
    wallet.transactions.filter((transaction) => {
      let type = "";

      if (transaction.type === "buy") {
        type = "✅";
      } else {
        type = "❌";
      }
      let fishEmoji = "";
      let g = transaction.amount / 1000;
      if (transaction.amount > 999) {
        for (let i = 0; i < Math.floor(g); i++) {
          fishEmoji = fishEmoji + "🐟";
        }
      }

      return (x =
        x +
        fishEmoji +
        `\n\n` +
        `💲 Amount: ${transaction.amount}\n` +
        `📅 date: ${transaction.date}\n` +
        `${type} type: ${transaction.type}\n\n`);
    });
    console.log(x);

    console.log(wallet.intervalBuy);
    console.log(wallet.intervalSell);
    if (wallet.intervalBuy.length) {
      wallet.intervalBuy.filter((interval, index) => {
        b = b + `${interval}\n`;
      });
    }
    console.log(b, 88);
    if (wallet.intervalSell.length) {
      wallet.intervalSell.filter((interval) => {
        s = s + interval`\n`;
      });
    }
    const message = `https://tonviewer.com/${wallet.wallet}\n💰 Balance: TON ${
      wallet.balance
    } = USD (${
      wallet.balance * wallet.price
    })\n\n${x}📈 intervalBuy: ${b}\📉 nintervalSell: ${s}\nbuy count: ${
      wallet.buyCount
    }\nsell count: ${wallet.sellCount}`;

    const activeChats = Object.keys(activeChatId);

    if (new Date(lastTransactionDate) > CURRENT_DATE) {
      await bot.telegram.sendMessage(GROUPP_CHAT_ID, message);
    }
    activeChats.map(async (key) => {
      if (new Date(lastTransactionDate) > activeChatId[key]) {
        await bot.telegram.sendMessage(key, message);
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
let timeoutId = null;

async function getAccount(account_id) {
  return new Promise((resolve, reject) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get(
          `https://tonapi.io/v2/blockchain/accounts/${account_id}`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        const data = response.data;
        const balance = data.balance / 1000000000;

        resolve(balance);
      } catch (error) {
        console.error("Error fetching data:", error);
        reject(error);
      } finally {
        timeoutId = null;
      }
    }, 2000);
  });
}
async function transactions() {
  try {
    const data = await fetchData();
    data.reverse();
    for (const item of data) {
      if (
        (item.attributes.kind === "sell" &&
          item.attributes.volume_in_usd > 499) ||
        item.attributes.volume_in_usd > 999
      ) {
        if (CURRENT_DATE < new Date(item.attributes.block_timestamp)) {
          const walletAddress = item.attributes.tx_from_address;
          let price = 0;
          if (item.attributes.kind === "buy") {
            price = Number(item.attributes.price_from_in_usd);
          } else {
            price = Number(item.attributes.price_to_in_usd);
          }
          const transaction = {
            hash: item.attributes.tx_hash,
            amount: item.attributes.volume_in_usd,
            date: ARMENIA_TIME(item.attributes.block_timestamp),
            type: item.attributes.kind,
          };
          const existingTransactions = await transactionModel.find({
            wallet: item.attributes.tx_from_address,
          });

          if (existingTransactions.length > 0) {
            const firstTransaction = existingTransactions[0];
            const matchingTransaction = firstTransaction.transactions.find(
              (existingTxn) => existingTxn.hash === transaction.hash
            );

            if (!matchingTransaction) {
              const timeAgoHy = new TimeAgo("hy");
              const newTransactionTime = new Date(transaction.date);
              let lastSellTransaction;
              let lastBuyTransaction;
              if (item.attributes.type === "sell") {
                console.log(1);
                for (
                  let i = firstTransaction.transactions.length - 1;
                  i >= 0;
                  i--
                ) {
                  const transaction = firstTransaction.transactions[i];
                  console.log(transaction);
                  if (transaction.type === "sell") {
                    lastSellTransaction = transaction;
                    break;
                  }
                }
              } else {
                console.log(2);
                for (
                  let i = firstTransaction.transactions.length - 1;
                  i >= 0;
                  i--
                ) {
                  const transaction = firstTransaction.transactions[i];
                  console.log(transaction);
                  if (transaction.type === "buy") {
                    lastBuyTransaction = transaction;
                    break;
                  }
                }
              }
              if (lastBuyTransaction) {
                const lastTransactionTime = new Date(lastBuyTransaction.date);
                const intervalInMilliseconds =
                  new Date(newTransactionTime) - lastTransactionTime;
                const formattedInterval = timeAgoHy.format(
                  Date.now() - intervalInMilliseconds
                );
                console.log(formattedInterval, "3");
                firstTransaction.intervalBuy.push(formattedInterval);
              } else if (lastSellTransaction) {
                const lastTransactionTime = new Date(lastSellTransaction.date);
                const intervalInMilliseconds =
                  new Date(newTransactionTime) - lastTransactionTime;
                const formattedInterval = timeAgoHy.format(
                  Date.now() - intervalInMilliseconds
                );
                console.log(formattedInterval, "4");
                firstTransaction.intervalSell.push(formattedInterval);
              } else {
                console.log("no have transaction");
              }

              const lastTransactionTime = new Date(
                firstTransaction.transactions[
                  firstTransaction.transactions.length - 1
                ].date
              );

              firstTransaction.transactions.push(transaction);

              if (item.attributes.kind === "buy") {
                firstTransaction.buyCount += 1;
              } else {
                firstTransaction.sellCount += 1;
              }

              const balance = await getAccount(walletAddress);
              firstTransaction.balance = balance;
              firstTransaction.price = price;
              await firstTransaction.save();
              sendNewTransaction(walletAddress);
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          } else {
            let buyCount = 0;
            let sellCount = 0;
            if (item.attributes.kind === "buy") {
              buyCount = 1;
            } else {
              sellCount = 1;
            }

            const balance = await getAccount(walletAddress);
            const newTransaction = new transactionModel({
              wallet: walletAddress,
              balance: balance,
              transactions: [transaction],
              intervalBuy: [],
              intervalSell: [],
              buyCount: buyCount,
              sellCount: sellCount,
              price: price,
            });
            await newTransaction.save();
            sendNewTransaction(walletAddress);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in transactions function:", error);
  }
}
transactions();
let loopInterval = 2000;

async function mainLoop() {
  try {
    await transactions();
  } catch (error) {
    console.error("Error in main loop:", error);
  } finally {
    setTimeout(mainLoop, loopInterval);
  }
}

mainLoop();

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const armenianDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Yerevan",
  });
  activeChatId[chatId] = armenianDate;
  console.log(activeChatId);
});

bot.on("text", async (ctx) => {
  const messageText = ctx.message.text;
  const chatId = ctx.chat.id;
  if (messageText === "quit") {
    delete activeChatId[chatId];
  }
});

bot.launch();

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});
