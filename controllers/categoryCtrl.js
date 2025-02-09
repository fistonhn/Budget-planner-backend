const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");
const User = require("../model/User");

const categoryController = {
  create: asyncHandler(async (req, res) => {
    let categoriesData = req.body; // This will be either a single object or an array of objects
    
    // If the request contains a single category (e.g., { name: 'categoryName' })
    if (categoriesData.name) {
      categoriesData = [{ "Categories": categoriesData.name }]; // Convert it to an array for consistency
    }
  
    // Validate that we have categories to process
    if (!categoriesData || categoriesData.length === 0) {
      throw new Error("At least one category name is required for creation.");
    }
  
    const userName = await User.findOne({ _id: req.user });
  
    const categoriesToCreate = [];
    const errors = [];
  
    // Loop through each category object and process the category names
    for (let categoryData of categoriesData) {
      const categoryName = categoryData.Categories;
  
      if (!categoryName) {
        errors.push("Name is required for each category.");
        continue;
      }
  
      const normalizedName = categoryName.toLowerCase();
  
      // Check if the category already exists
      const categoryExists = await Category.findOne({ Name: normalizedName });
      if (categoryExists) {
        errors.push(`Category "${categoryExists.Name}" already exists in the database.`);
        continue;
      }
  
      // If category doesn't exist, prepare to create it
      categoriesToCreate.push({
        user: req.user,
        Name: normalizedName,
        RecordedBy: userName.username,
      });
    }
  
    // If we have categories to create, bulk insert them
    if (categoriesToCreate.length > 0) {
      const createdCategories = await Category.insertMany(categoriesToCreate);
      
      // Send success response
      res.status(201).json({ createdCategories, errors });
    } else {
      // If no valid categories were found to be created
      res.status(400).json({ message: "No valid categories to create.", errors });
    }
  }),

  //!lists
  lists: asyncHandler(async (req, res) => {
    const categories = await Category.find({ user: req.user });
    res.status(200).json(categories);
  }),

  //!update
  update: asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;  
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
  
    const normalizedName = name.toLowerCase();
    
    try {
      // Find the category by ID
      const category = await Category.findById(categoryId);
  
      // If the category is not found or the user is not authorized to update it
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      // Ensure that the logged-in user owns the category
      if (category.user.toString() !== req.user) {
        return res.status(403).json({ message: "User not authorized to update this category" });
      }
  
      // Update category name if the new name is provided
      category.Name = normalizedName || category.Name;
  
      // Save the updated category
      await category.save();
  
      // Respond with a success message
      res.status(200).json({ message: "Category updated successfully" });
    } catch (err) {
      // Handle any unexpected errors
      res.status(500).json({ message: "An error occurred while updating the category", error: err.message });
    }
  }),
  
  //! delete
  delete: asyncHandler(async (req, res) => {
    try {
      // Find the category by ID and delete it
      const category = await Category.findByIdAndDelete(req.params.id);
  
      // If the category is not found
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Ensure that the logged-in user owns the category
      if (category.user.toString() !== req.user) {
        return res.status(403).json({ message: "User not authorized to delete this category" });
      }
  
      // Respond with success message
      res.status(200).json({ message: "Category Deleted successfully!" });
    } catch (err) {
      console.log("Error deleting category:", err);
      // Handle any unexpected errors
      res.status(500).json({ message: "An error occurred while deleting the category", error: err.message });
    }
  }),
  
};

module.exports = categoryController;
