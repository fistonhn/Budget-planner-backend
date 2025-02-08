const asyncHandler = require("express-async-handler");
const Budget = require("../model/Budget");
const BudgetController = {
  //!add
  create: asyncHandler(async (req, res) => {
    
    try {
        const projectOwnerId = req.user;

        const projectData = new Budget({
            projectName: req.body.projectName,
            projectOwnerId: projectOwnerId,
            teamEmails: req.body.teamEmails,
            budgetData: req.body.budgetData
          });
      
          const saveData = await projectData.save();
      
          res.status(200).send('Project Budget saved successfully');
          console.log('Project Budget saved successfully');
      
        // const saveData = await Budget.insertMany(budgetData.data);
        // Send response
       res.status(200).json({ message: "Project Budget created successfully", saveData });

      } catch (error) {
        console.error("Error saving Budget to database:", error);
        res.status(500).json({ message: "Error saving Budget to database", error });
      }
  }),

  lists: asyncHandler(async (req, res) => {
    try {
        const budgetData = await Budget.find();
    
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
