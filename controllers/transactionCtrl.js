const asyncHandler = require("express-async-handler");
const Transaction = require("../model/Transaction");
const User = require("../model/User");


const transactionController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { projectName, category, description, quantity, unit, price, amount, paymentMethod, date } = req.body;

    const userName = await User.findOne({ _id: req.user });

    if (!userName) {
      res.status(401).json({ message: "Invalid token, Not authorized user!" });
      return;
    }
    
    if (!amount || !category || !date || !projectName || !quantity || !unit || !paymentMethod || !price) {
      throw new Error("Fill all required fields");
    }

    //! Create
    const transaction = await Transaction.create({
      user: req.user,
      projectName,
      category,
      description,
      quantity,
      unit,
      price,
      amount,
      paymentMethod,
      recordedBy: userName.username,
      date,

    });

    res.status(201).json({ message: "Transaction Budget recorded successfully", transaction });

  }),

  importTransactions: asyncHandler(async (req, res) => {
    let categoriesData = req.body;
    
    // Validate that we have categories to process
    if (categoriesData.length === 0) {
      throw new Error(" No transactions found!");
    }
  
    const userName = await User.findOne({ _id: req.user });
  
    const transactionsToCreate = [];
    const errors = [];
  
    // Loop through each category object and process the category names
    for (let categoryData of categoriesData) {
      
      // If category doesn't exist, prepare to create it
      transactionsToCreate.push({
        user: req.user,
        projectName: categoryData.projectName,
        category: categoryData.category,
        description: categoryData.description,
        quantity: categoryData.quantity,
        unit: categoryData.unit,
        price: categoryData.price,
        amount: categoryData.price * categoryData.quantity,
        paymentMethod: categoryData.paymentMethod,
        recordedBy: userName.username,
        date: categoryData.date,
      });
    }
  
    // If we have categories to create, bulk insert them
    if (transactionsToCreate.length > 0) {
      const createdTransactions = await Transaction.insertMany(transactionsToCreate);
      
      // Send success response
      res.status(201).json({ message: "Transactions imported successfully", createdTransactions });
    } else {
      // If no valid categories were found to be created
      res.status(400).json({ message: "Invalid file! Please upload valid file.", errors });
    }
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

  update: asyncHandler(async (req, res) => { 
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        throw new Error("Transaction not found");
    }

    if (transaction.user.toString() !== req.user.toString()) {
        throw new Error("Not authorized to update this transaction");
    }

    // Update the fields only if the new value is provided
    transaction.projectName = req.body.projectName || transaction.projectName;
    transaction.category = req.body.category || transaction.category;
    transaction.description = req.body.description || transaction.description;
    transaction.quantity = req.body.quantity || transaction.quantity;
    transaction.unit = req.body.unit || transaction.unit;
    transaction.price = req.body.price || transaction.price;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.paymentMethod = req.body.paymentMethod || transaction.paymentMethod;
    transaction.date = req.body.date || transaction.date;

    // Save the updated transaction
    const updatedTransaction = await transaction.save();

    // Respond with the updated transaction
    res.status(200).json({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
    });
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
