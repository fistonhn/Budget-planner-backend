const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    Code: { type: String, required: false },
    Description: { type: String, required: false },
    Quantity: { type: Number, required: false },
    UOM: { type: String, required: false },
    Rate: { type: Number, required: false },
    Amount: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);
