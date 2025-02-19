const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    projectName: { type: String, required: true },
    code: { type: String, required: false },
    description: { type: String, required: false },
    quantity: { type: Number, required: false },
    unit: { type: String, required: false },
    rate: { type: Number, required: false },
    amount: { type: Number, required: false },
    progress: { type: Number, required: false },
    currentAmount: { type: Number, required: false },
    category: { type: String, required: false },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);
