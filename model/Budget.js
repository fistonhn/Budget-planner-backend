const mongoose = require("mongoose");
const Category = require("./Category");

const budgetSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    projectOwnerId: { type: String, required: true },
    teamEmails: { type: [String], required: false },
    budgetData: [{
      Code: { type: String, required: false },
      Description: { type: String, required: false },
      Quantity: { type: Number, required: false },
      UOM: { type: String, required: false },
      Rate: { type: Number, required: false },
      Amount: { type: Number, required: false },
      Progress: { type: Number, required: false },
      CurrentAmount: { type: Number, required: false },
  }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);
