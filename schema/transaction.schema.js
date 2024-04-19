const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    wallet: String,
    balance: String,
    transactions: Array,
    intervalBuy: Array,
    intervalSell: Array,
    buyCount: Number,
    sellCount: Number,
    price: Number,
  },
  {
    timestamps: true,
  }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;
