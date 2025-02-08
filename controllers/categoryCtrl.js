const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");
const User = require("../model/User");

const categoryController = {
  //!add
  create: asyncHandler(async (req, res) => {
    
    const { name } = req.body;
    if (!name) {
      throw new Error("Name is required for creating a category");
    }
    const normalizedName = name.toLowerCase();
    const userName = await User.findOne({ _id: req.user });

    //!Check if category already exists on the user
    const categoryExists = await Category.findOne({
      Name: normalizedName,
    });
    if (categoryExists) {
      throw new Error(
        `Category ${categoryExists.Name} already exists in the database`
      );
    }
    //! Create the category
    const category = await Category.create({
      user: req.user,
      Name: normalizedName,
      RecordedBy: userName.username,
    });
    res.status(201).json(category);
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
      if (category.user.toString() !== req.user.id) {
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
  
      // Respond with success message
      res.status(200).json({ message: "Category removed successfully, transactions updated" });
    } catch (err) {
      // Handle any unexpected errors
      res.status(500).json({ message: "An error occurred while deleting the category", error: err.message });
    }
  }),
  
};

module.exports = categoryController;
