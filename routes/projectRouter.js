const express = require("express");
const projectController = require("../controllers/projectCtrl");
const isAuthenticated = require("../middlewares/isAuth");
const projectRouter = express.Router();

projectRouter.post("/api/v1/projects/create", isAuthenticated, projectController.create);

projectRouter.get("/api/v1/projects/lists", isAuthenticated, projectController.lists);

projectRouter.delete("/api/v1/projects/delete/:id", isAuthenticated, projectController.deleteProject);

module.exports = projectRouter;
