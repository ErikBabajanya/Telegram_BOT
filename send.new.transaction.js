require("dotenv").config();
const GROUPP_CHAT_ID = process.env.GROUPP_CHAT_ID;
const CURRENT_DATE = new Date();
const activeChatId = {};
async function sendNewTransaction(walletAddress) {
  try {
    const myWallet = await transactionModel.find({ wallet: walletAddress });
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
    wallet.transactions.filter((transaction) => {
      return (x =
        x +
        `Amount: ${transaction.amount}\n` +
        `date: ${transaction.date}\n` +
        `type: ${transaction.type}\n\n`);
    });
    if (wallet.intervalBuy.length) {
      wallet.intervalBuy.filter((interval) => {
        b = b + interval`\n`;
      });
    }
    if (wallet.intervalSell.length) {
      wallet.intervalSell.filter((interval) => {
        s = s + interval`\n`;
      });
    }
    const message = `https://tonviewer.com/${wallet.wallet}\nBalance: TON ${
      wallet.balance
    } = USD (${
      wallet.balance * wallet.price
    })\n\n${x}intervalBuy: ${b}\nintervalSell: ${s}\nbuy count: ${
      wallet.buyCount
    }\nsell count: ${wallet.sellCount}`;

    const activeChats = Object.keys(activeChatId);

    // if (new Date(lastTransactionDate) > CURRENT_DATE) {
    //   await bot.telegram.sendMessage(GROUPP_CHAT_ID, message);
    // }
    activeChats.map(async (key) => {
      if (new Date(lastTransactionDate) > activeChatId[key]) {
        await bot.telegram.sendMessage(key, message);
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

module.exports = sendNewTransaction;
