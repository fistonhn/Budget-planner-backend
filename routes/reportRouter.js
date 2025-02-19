const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const reportController = require("../controllers/reportCtrl");
const reportRouter = express.Router();

//! lists
reportRouter.post(
  "/api/v1/report/listsByProject",
  isAuthenticated,
  reportController.listsByProject
);


module.exports = reportRouter;
