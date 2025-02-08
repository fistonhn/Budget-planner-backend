const asyncHandler = require("express-async-handler");
const Transaction = require("../model/Transaction");
const User = require("../model/User");


const transactionController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { type, category, amount, currency, date, description, projectName, quantity, unit, paymentMethod, vendor } = req.body;

    const userName = await User.findOne({ _id: req.user });

    // check if category is already in the database
    const categoryExists = await Transaction.findOne({ category });
    if (categoryExists) {
      throw new Error("Category already exists");
    }
    
    
    if (!amount || !type || !date || !category) {
      throw new Error("Fill all required fields");
    }

    //! Create
    const transaction = await Transaction.create({
      user: req.user,
      type,
      category,
      amount,
      currency,
      description,
      date,
      projectName,
      quantity,
      unit,
      paymentMethod,
      vendor,
      recordedBy: userName.username,
    });

    res.status(201).json({ message: "Transaction Budget recorded successfully", transaction });

  }),

  //!lists
  getFilteredTransactions: asyncHandler(async (req, res) => {
    const { startDate, endDate, type, category } = req.query;
    let filters = { user: req.user };

    if (startDate) {
      filters.date = { ...filters.date, $gte: new Date(startDate) };
    }
    if (endDate) {
      filters.date = { ...filters.date, $lte: new Date(endDate) };
    }
    if (type) {
      filters.type = type;
    }
    if (category) {
      if (category === "All") {
        //!  No category filter needed when filtering for 'All'
      } else if (category === "Uncategorized") {
        //! Filter for transactions that are specifically categorized as 'Uncategorized'
        filters.category = "Uncategorized";
      } else {
        filters.category = category;
      }
    }
    const transactions = await Transaction.find(filters).sort({ date: -1 });
    res.json(transactions);
  }),

  //!update
  update: asyncHandler(async (req, res) => {
    //! Find the transaction
    const transaction = await Transaction.findById(req.params.id);
    if (transaction && transaction.user.toString() === req.user.toString()) {
      (transaction.type = req.body.type || transaction.type),
        (transaction.category = req.body.category || transaction.category),
        (transaction.amount = req.body.amount || transaction.amount),
        (transaction.date = req.body.date || transaction.date),
        (transaction.description =
          req.body.description || transaction.description);
      //update
      const updatedTransaction = await transaction.save();
      res.json(updatedTransaction);
    }
  }),
  //! delete
  delete: asyncHandler(async (req, res) => {
    //! Find the transaction
    const transaction = await Transaction.findById(req.params.id);
    if (transaction && transaction.user.toString() === req.user.toString()) {
      await Transaction.findByIdAndDelete(req.params.id);
      res.json({ message: "Transaction removed" });
    }
  }),
};

module.exports = transactionController;
