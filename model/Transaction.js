const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    projectName: { type: String, required: false },
    category: { type: String, required: true, default: "Uncategorized", },
    description: { type: String, required: false, },
    quantity: { type: Number, required: false },
    unit: { type: String, required: false },
    price: { type: Number, required: false },
    amount: { type: Number, required: true, },
    paymentMethod: { type: String, required: false },
    recordedBy: { type: String, required: true },
    date: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
