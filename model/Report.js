const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    projectName: { type: String, required: true },
    description: { type: String, required: false },
    expenseAmount: { type: Number, required: false },
    incomeAmount: { type: Number, required: false },
    amount: { type: Number, required: false },
    category: { type: String, required: false },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
