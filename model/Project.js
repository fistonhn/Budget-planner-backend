const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    name: { type: String, required: true },
    projectCode: { type: String, required: false },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    location: { type: String, required: false },
    manager: { type: String, required: false },
    description: { type: String, required: false }

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
