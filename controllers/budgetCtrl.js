const asyncHandler = require("express-async-handler");
const Budget = require("../model/Budget");
const Report = require("../model/Report");

const BudgetController = {
  //!add
  create: asyncHandler(async (req, res) => {
    console.log("scscwcdcw", req.body)
    try {
        const projectOwnerId = req.user;

        const projectData = new Budget({
            projectName: req.body.projectName,
            projectOwnerId: projectOwnerId,
            teamEmails: req.body.teamEmails,
            budgetData: req.body.budgetData
          });
      
          const saveData = await projectData.save();      
       res.status(200).json({ message: "Project Budget created successfully", saveData });

      } catch (error) {
        // console.error("Error saving Budget to database:", error);
        res.status(500).json({ message: "Error saving Budget to database", error });
      }
  }),

  importIncomes: asyncHandler(async (req, res) => {
    let { budgetData, projectName, progress } = req.body;
    
    // Validate that we have categories to process
    if (budgetData.length === 0) {
      throw new Error(" No data found!");
    }
    
    const incomesToCreate = [];
    const errors = [];

  
    // Loop through each category object and process
    for (let incomeData of budgetData) {
      
      incomesToCreate.push({
        user: req.user,
        projectName: projectName,
        code: incomeData.Code,
        description: incomeData.Description,
        quantity: incomeData.Quantity,
        unit: incomeData.UOM,
        rate: incomeData.Rate,
        amount: incomeData.Amount,
        progress: (incomeData.Amount ? progress : null),
        currentAmount: (incomeData.Amount ? (incomeData.Amount * progress) : null),
      });
    }

    // console.log('incomesToCreateincomesToCreate', incomesToCreate)
  
    if (incomesToCreate.length > 0) {
      const createdBudgets = await Budget.insertMany(incomesToCreate);
      
      // Send success response
      res.status(201).json({ message: "Budgets imported successfully", createdBudgets });
    } else {
      // If no valid categories were found to be created
      res.status(400).json({ message: "Invalid file! Please upload valid file.", errors });
    }
  }),

  updateIncomes: asyncHandler(async (req, res) => {
    let { currentAmount, amount, category, id, progress, projectName, description } = req.body;
      try {
        // Find the existing budget record using the unique code and project name
        const existingBudget = await Budget.findById(id);
  
        if (existingBudget) {
          existingBudget.progress = progress;
          existingBudget.currentAmount = currentAmount;  
          existingBudget.category = category;
  
          // Save the updated record
          const updatedBudgets = await existingBudget.save();

          // update or create report table
          const existingReport = await Report.findById(id);
          if(existingReport){
            // console.log('existingRepoxxxxxxxxxx', existingReport)

            existingReport.incomeAmount = currentAmount || existingReport.incomeAmount;  
            existingReport.category = category || existingReport.category;
            const updateThisReport = await existingReport.save();

            // console.log('updateThisReport', updateThisReport)

          } else {
            const reportData = new Report({
              user: req.user,
              projectName: projectName,
              description: description,
              incomeId: id,
              incomeAmount: currentAmount,
              amount: amount,
              category: category ? category : 'Not Categorized',
            });
            const repot = await reportData.save(); 
            // console.log('repot', repot)
          }

          res.status(200).json({ message: "Budgets updated successfully", updatedBudgets });

        } else {
          throw new Error(" No budget found!");

        }
      } catch (err) {
        // Catch any errors in the loop and log them
        res.status(500).json({ message: "No valid budgets were found to update", err });
      }
  }),
  
  

  listsByProject: asyncHandler(async (req, res) => {
    try {
        const budgetDataByProj = await Budget.find({user: req.user, projectName: req.body.projectName});
    
        res.status(200).json({ message: "Budgets listed successfully", budgetDataByProj });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Error fetching data from the database", error });
      }
    
  }),

  lists: asyncHandler(async (req, res) => {
    try {
        const budgetData = await Budget.find({user: req.user});
    
        // Send the data as a JSON response
        res.status(200).json(budgetData);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Error fetching data from the database", error });
      }
    
  }),

// Display a single budget by ID
  getBudgetById: asyncHandler(async (req, res) => {
    try {
        const budgetId = req.params.id;
        
        // Find the budget by ID in MongoDB
        const budget = await Budget.findById(budgetId);
        
        if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
        }
        
        res.status(200).json(budget);  // Send the budget data as a response
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ message: "Error fetching budget", error });
    }
    
 }),

  //!update
  update: asyncHandler(async (req, res) => {
    try {
        const budgetId = req.params.id;
        const updatedBudgetData = req.body;
    
        // Update the budget by ID in MongoDB
        const updatedBudget = await Budget.findByIdAndUpdate(
          budgetId, 
          updatedBudgetData, 
          { new: true }  // Return the updated document
        );
        
        if (!updatedBudget) {
          return res.status(404).json({ message: "Budget not found" });
        }
    
        res.status(200).json(updatedBudget);  // Send the updated budget data as a response
      } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Error updating budget", error });
      }
  }),
//! delete
  delete: asyncHandler(async (req, res) => {
    try {
        const budgetId = req.params.id;
        
        // Delete the budget by ID from MongoDB
        const deletedBudget = await Budget.findByIdAndDelete(budgetId);
        
        if (!deletedBudget) {
          return res.status(404).json({ message: "Budget not found" });
        }
    
        res.status(200).json({ message: "Budget deleted successfully" }); 
      } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ message: "Error deleting budget", error });
      }
    
  }),
  //! delete all

  deleteAll: asyncHandler(async (req, res) => {
    try {
        // Delete all budgets from the database
        const result = await Budget.deleteMany({});
        
        // Check if any documents were deleted
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "No budgets found to delete" });
        }
        
        // Send a success response
        res.status(200).json({ message: "All budgets deleted successfully" });
      } catch (error) {
        console.error("Error deleting all budgets:", error);
        res.status(500).json({ message: "Error deleting all budgets", error });
      }    
    
  }),
};


module.exports = BudgetController;
