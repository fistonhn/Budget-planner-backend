const mongoose = require("mongoose");

// Define the schema for the project object
const projectRightSchema = new mongoose.Schema({
  right: { type: String, required: false },
  projectId: { type: String, required: false },
  projectName: { type: String, required: false },
});

// Define the main user schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    projectsRight: { type: [projectRightSchema], required: false },  // Array of project objects
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
