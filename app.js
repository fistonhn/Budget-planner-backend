const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const budgetRouter = require("./routes/budgetRouter");

const transactionRouter = require("./routes/transactionRouter");
const app = express();

//!Connect to mongodb
mongoose
  .connect("mongodb+srv://fistonkerapay:fistonkerapay@cluster0.amcgs.mongodb.net/AviatorPredictorPro?retryWrites=true&w=majority")
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log(e));

//! Cors config
app.use(cors({origin: "*"}));

app.use(express.json());
//!Routes
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", budgetRouter);
app.use("/", transactionRouter);
//! Error
app.use(errorHandler);

// if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () =>
    console.log(`Server is running on this port... ${PORT} `)
  );
// }
module.exports = app;
