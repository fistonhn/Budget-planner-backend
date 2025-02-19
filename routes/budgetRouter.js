const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const budgetController = require("../controllers/budgetCtrl");
const budgetRouter = express.Router();

//!add
budgetRouter.post(
  "/api/v1/budget/create",
  isAuthenticated,
  budgetController.create
);

budgetRouter.post(
  "/api/v1/budget/importIncomes",
  isAuthenticated,
  budgetController.importIncomes
);

//! lists
budgetRouter.get(
  "/api/v1/budget/lists",
  isAuthenticated,
  budgetController.lists
);

budgetRouter.post(
  "/api/v1/budget/listsByProject",
  isAuthenticated,
  budgetController.listsByProject
);

budgetRouter.post(
  "/api/v1/budget/updateIncomes",
  isAuthenticated,
  budgetController.updateIncomes
);

//! get by id
budgetRouter.get(
  "/api/v1/budget/:id",
  isAuthenticated,
  budgetController.getBudgetById
);
// //! update
budgetRouter.put(
  "/api/v1/budget/update/:budgetId",
  isAuthenticated,
  budgetController.update
);
//! delete
budgetRouter.delete(
  "/api/v1/budget/delete/:id",
  isAuthenticated,
  budgetController.delete
);
//! delete all
budgetRouter.delete(
  "/api/v1/budget/deleteAll",
  isAuthenticated,
  budgetController.deleteAll
);

module.exports = budgetRouter;
