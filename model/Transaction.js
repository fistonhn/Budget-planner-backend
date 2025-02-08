const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    type: { type: String, required: true, enum: ["income", "expense"], },
    category: { type: String, required: true, default: "Uncategorized", },
    amount: { type: Number, required: true, },
    currency: { type: String, required: false, default: "USD", },
    date: { type: Date, default: Date.now, },
    description: { type: String, required: false, },
    projectName: { type: String, required: false },
    quantity: { type: Number, required: false },
    unit: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    vendor: { type: String, required: false },
    recordedBy: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
