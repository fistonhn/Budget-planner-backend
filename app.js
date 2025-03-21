const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const userRouter = require("./routes/userRouter");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const budgetRouter = require("./routes/budgetRouter");

const transactionRouter = require("./routes/transactionRouter");
const projectRouter = require("./routes/projectRouter");
const reportRouter = require("./routes/reportRouter");

const app = express();

//!Connect to mongodb
mongoose
  .connect('process.env.MONGODB_URI')
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log(e));

//! Cors config
app.use(cors({origin: "*"}));

app.use(express.json());
//!Routes
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", budgetRouter);
app.use("/", projectRouter);
app.use("/", transactionRouter);
app.use("/", reportRouter);

app.use(express.static(path.join(__dirname, 'dist')));

// Add routes for your API here (e.g. /api)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//! Error
app.use(errorHandler);

// if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () =>
    console.log(`Server is running on this port... ${PORT} `)
  );
// }
module.exports = app;
