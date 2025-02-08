const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    Name: { type: String, required: true },
    RecordedBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
