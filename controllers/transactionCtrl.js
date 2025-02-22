const asyncHandler = require("express-async-handler");
const Transaction = require("../model/Transaction");
const User = require("../model/User");
const Report = require("../model/Report");

const transactionController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { projectName, category, description, quantity, unit, price, amount, contractAmount, paymentMethod, date, fullSelectedReport } = req.body;
    // console.log('fullSelectedReport', fullSelectedReport)

    const userName = await User.findOne({ _id: req.user });

    if (!userName) {
      res.status(401).json({ message: "Invalid token, Not authorized user!" });
      return;
    }

    // verify rights user have for project
    const userExisted = await User.findById(req.user);
    const userProjects = userExisted.projectsRight;
    const projectRight = userProjects.find((proj) => proj.projectName === projectName);

    if (!projectRight || projectRight.right === 'ReadOnly') {
      return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
    }
    
    
    if (!contractAmount, !amount || !category || !date || !projectName || !quantity || !unit || !paymentMethod || !price || !fullSelectedReport) {
      return res.status(400).json({ message: "Fill all required fields" });
    }

    try {
      const reportData = new Report({
        user: req.user,
        projectName: projectName,
        description: fullSelectedReport.description,
        expenseAmount: amount,
        amount: fullSelectedReport.amount,
        category: category,
      });
      const repot = await reportData.save(); 

      
      const incomeReportData = {
        reportId: repot._id,
        incomeCategory: repot?.category,
        incomeDescription: repot?.description,
      }

      const transaction = await Transaction.create({
        user: req.user,
        projectName,
        category: repot?.category,
        description,
        quantity,
        unit,
        price,
        amount,
        paymentMethod,
        recordedBy: userName.username,
        date,
        incomeReportData

      });

      const saveTransaction = await transaction.save();   
      // console.log('saveTransactionsaveTransaction', saveTransaction)      

      res.status(201).json({ message: "Transaction Budget recorded successfully", saveTransaction });
    } catch (err) {
      res.status(500).json({ message: "Error saving data", err });
    }

  }),

  importTransactions: asyncHandler(async (req, res) => {
    const categoriesData = req.body;
    
    try {
      // Loop through each category and create reports and transactions
      for (let data of categoriesData) {
        const reportData = new Report({
          user: req.user,
          projectName: data.projectName,
          description: data.description,
          expenseAmount: data.price * data.quantity,
          amount: data.price * data.quantity,
          category: data.category,
        });
        
        const savedReport = await reportData.save();
    
        const userName = await User.findOne({ _id: req.user });
    
        const incomeReportData = {
          reportId: savedReport._id,
          incomeCategory: savedReport?.category,
          incomeDescription: savedReport?.description,
        };
    
        const transaction = new Transaction({
          user: req.user,
          projectName: data.projectName,
          category: data.category,
          description: data.description,
          quantity: data.quantity,
          unit: data.unit,
          price: data.price,
          amount: data.price * data.quantity,  // Assuming price * quantity to calculate amount
          paymentMethod: data.paymentMethod,
          recordedBy: userName.username,
          date: data.date,
          incomeReportData,
        });
    
        const savedTransaction = await transaction.save();
    
        // Optionally, log the saved transaction or handle additional operations
        console.log('Transaction saved: ', savedTransaction);
      }
    
      res.status(201).json({ message: "Transactions recorded successfully." });
    } catch (err) {
      res.status(500).json({ message: "Error saving data", err });
    }    

  }),

  //!lists
  listsByProject: asyncHandler(async (req, res) => {
    const userExisted = await User.findById(req.user);  
    if (!userExisted) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Get the user's project rights (projects the user has access to)
    const userProjects = userExisted.projectsRight;
  
    // Get the project ids from the user's project rights
    const projectNames = userProjects.map((projRight) => projRight.projectName);
    console.log('projectNames', projectNames)

  
    // Find all projects that have a name that exists in the user's project rights
    const myTransactions = await Transaction.find({
      'projectName': { $in: projectNames },
    });
  
    console.log('myTransactions', myTransactions)
    res.status(200).json({
      message: "Projects listed successfully",
      myTransactions,
    });
  
    }),

  update: asyncHandler(async (req, res) => { 

  try{
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }

    if (transaction.user.toString() !== req.user.toString()) {
      return res.status(401).json({ message: "Not authorized to update this transaction!" });
    }

     // verify rights user have for project
     const userExisted = await User.findById(req.user);
     // Get the user's project rights (projects the user has access to)
     const userProjects = userExisted.projectsRight;
     const projectRight = userProjects.find((proj) => proj.projectName === req.body.projectName);
 
     if (!projectRight || projectRight.right === 'ReadOnly') {
       return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
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

      const fullSelectedReport = req.body.fullSelectedReport
      // console.log('fullSelectedReport', fullSelectedReport)
      const reportId = fullSelectedReport._id
      const existingReport = await Report.findById(reportId);

      if(existingReport){
          existingReport.expenseAmount = req.body.amount || fullSelectedReport.amount;  

          const updateThisReport = await existingReport.save();
          // console.log('updateThisReportkkkkkkkkkkk', updateThisReport)

      } else {
        return res.status(404).json({ message: "Please Select existing Report!" });
      }
    // Respond with the updated transaction
    res.status(200).json({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
    });
  }  catch (err) {
      // Catch any errors in the loop and log them
      console.log(err)
      res.status(500).json({ message: "No valid budgets were found to update", err });
    }
}),

  //! delete
  delete: asyncHandler(async (req, res) => {
    
    const transaction = await Transaction.findById(req.params.id);

    console.log('transactiontransactiontransaction', transaction)

    // verify rights user have for project
    const userExisted = await User.findById(req.user);
    const userProjects = userExisted.projectsRight;
    const projectRight = userProjects.find((proj) => proj.projectName === transaction.projectName);

    if (!projectRight || projectRight.right === 'ReadOnly') {
      return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
    }

    // if (transaction && transaction.user.toString() === req.user.toString()) {

    //   await Transaction.findByIdAndDelete(req.params.id);

    //   const existingReport = await Report.findOne({expenseId: req.params.id});
    //   if(existingReport) {
    //     await Report.findByIdAndDelete(existingReport._id);

    //   }

    //   res.json({ message: "Transaction removed" });
    // }
  }),
};

module.exports = transactionController;
