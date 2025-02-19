const express = require("express");
const projectController = require("../controllers/projectCtrl");
const isAuthenticated = require("../middlewares/isAuth");
const userRouter = express.Router();

userRouter.post("/api/v1/projects/create", isAuthenticated, projectController.create);

userRouter.get("/api/v1/projects/lists", isAuthenticated, projectController.lists);

// userRouter.put("/api/v1/users/update-project", isAuthenticated, projectController.updateProject);

module.exports = userRouter;
