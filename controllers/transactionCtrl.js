const asyncHandler = require("express-async-handler");
const Transaction = require("../model/Transaction");
const User = require("../model/User");
const Report = require("../model/Report");

const transactionController = {
  create: asyncHandler(async (req, res) => {
    const { projectName, category, description, quantity, unit, price, amount, paymentMethod, date, fullSelectedReport } = req.body;

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
    
    
    if (!amount || !category || !date || !projectName || !quantity || !unit || !paymentMethod || !price || !description) {
      return res.status(400).json({ message: "Fill all required fields" });
    }

    try {
      const reportData = new Report({
        user: req.user,
        projectName: projectName,
        description: fullSelectedReport ? fullSelectedReport.description : description,
        expenseAmount: amount,
        amount: fullSelectedReport ? fullSelectedReport.amount : amount,
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
  // verify rights user have for the project
    const userExisted = await User.findById(req.user);
    const userProjects = userExisted.projectsRight;
    const projectRight = userProjects.find((proj) => proj.projectName === req.body.projectName);

    // console.log('projectRight', projectRight)

    if (!projectRight || projectRight.right === 'ReadOnly') {
      return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
    }
    
    const importedTransactionData = req.body.fileExcelData;
    const projectName = req.body.projectName;
    const category = req.body.category
    try {
      for (let data of importedTransactionData) {
        const reportData = new Report({
          user: req.user,
          projectName: projectName,
          description: data.description,
          expenseAmount: data.price * data.quantity,
          amount: data.price * data.quantity,
          category: category,
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
          projectName: projectName,
          category: category,
          description: data.description,
          quantity: data.quantity,
          unit: data.unit,
          price: data.price,
          amount: data.price * data.quantity,
          paymentMethod: data.paymentMethod,
          recordedBy: userName.username,
          date: data.date,
          incomeReportData,
        });
    
        const savedTransaction = await transaction.save();
    
      }
    
      res.status(201).json({ message: "Transactions recorded successfully." });
    } catch (err) {
      // console.log('err', err)
      res.status(500).json({ message: "Internal Server Error! Contact admin.", err });
    }    

  }),

  //!lists
  listsByProject: asyncHandler(async (req, res) => {
    const userExisted = await User.findById(req.user);  
    if (!userExisted) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // const userProjects = userExisted.projectsRight;
    // const projectNames = userProjects.map((projRight) => projRight.projectName);
    const myTransactions = await Transaction.find({
      'projectName': { $in: req.body.projectName },
    });
  
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
  try {
    const transaction = await Transaction.findById(req.params.id);

    // verify rights user have for project
    const userExisted = await User.findById(req.user);
    const userProjects = userExisted.projectsRight;
    const projectRight = userProjects.find((proj) => proj.projectName === transaction.projectName);

    if (!projectRight || projectRight.right === 'ReadOnly') {
      return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
    }

    if (transaction && transaction.user.toString() === req.user.toString()) {

      await Transaction.findByIdAndDelete(req.params.id);

      const reportId = transaction.incomeReportData.reportId
      await Report.findByIdAndDelete(reportId);


      res.json({ message: "Transaction Deleted Successfuly" });

    }
  } catch(error){
      console.log('error', error)
    }
    
  }),
};

// deleteAllTransactions: asyncHandler(async (req, res) => {
//   try {
//     const userExisted = await User.findById(req.user);
//     const userProjects = userExisted.projectsRight;

//     const projectName = req.params.projectName;
//     const projectRight = userProjects.find((proj) => proj.projectName === projectName);

//     if (!projectRight || projectRight.right === 'ReadOnly') {
//       return res.status(401).json({ message: "Project access limited to ReadOnly Project!" });
//     }

//     const transactions = await Transaction.find({ projectName: projectName });

//     if (!transactions || transactions.length === 0) {
//       return res.status(404).json({ message: "No transactions found for this project!" });
//     }

//     const bulkOps = [];

//     // Iterate over transactions and prepare bulk delete operations
//     for (let transaction of transactions) {
//       if (transaction.user.toString() === req.user.toString()) {
//         // Prepare delete for transaction
//         bulkOps.push({
//           deleteOne: {
//             filter: { _id: transaction._id }
//           }
//         });

//         // Prepare delete for associated report
//         if (transaction.incomeReportData?.reportId) {
//           bulkOps.push({
//             deleteOne: {
//               filter: { _id: transaction.incomeReportData.reportId }
//             }
//           });
//         }
//       }
//     }

//     if (bulkOps.length > 0) {
//       await Transaction.bulkWrite(bulkOps);
//     }

//     res.json({ message: "All Transactions and associated reports deleted successfully" });

//   } catch (error) {
//     console.log('Error deleting transactions:', error);
//     res.status(500).json({ message: "Server Error" });
//   }
// }),


module.exports = transactionController;
