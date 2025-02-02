const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import route handlers
const userRouter = require("./routes/userRouter");
const categoryRouter = require("./routes/categoryRouter");
const transactionRouter = require("./routes/transactionRouter");

// Import error handling middleware
const errorHandler = require("./middlewares/errorHandlerMiddleware");

const app = express();

// MongoDB connection (hardcoded connection string)
const mongoURI = "mongodb+srv://fistonkerapay:fistonkerapay@cluster0.amcgs.mongodb.net/AviatorPredictorPro?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.error("MongoDB connection error:", error));


  app.use(cors({origin: "*"}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Route handlers
app.use("/users", userRouter);  // Use '/users' for user-related routes
app.use("/categories", categoryRouter); // Use '/categories' for category-related routes
app.use("/transactions", transactionRouter); // Use '/transactions' for transaction-related routes

// Global error handling middleware (ensure it's last)
app.use(errorHandler);

// Start the server
const PORT = 8000; // Hardcoded port (or use process.env.PORT in case of deployment)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
