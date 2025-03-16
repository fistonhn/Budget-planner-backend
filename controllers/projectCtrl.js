const asyncHandler = require("express-async-handler");
const Project = require("../model/Project");
const User = require("../model/User");
const Budget = require("../model/Budget");
const Report = require("../model/Report");
const Transaction = require("../model/Transaction");

const projectController = {
  create: asyncHandler(async (req, res) => {
    try {
        const projectExisist = await Project.findOne({ name: req.body.name });        
        if (projectExisist) {
            res.status(401).json({ message: "Project Already existed" });
            return;
        }
        
        const projectData = new Project({
            user: req.user,
            name: req.body.name,
            description: req.body.description,
            projectCode: req.body.projectCode,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            manager: req.body.manager
        });

        
        const saveProjectData = await projectData.save();

        const userId = req.user
        const userExisted = await User.findById(userId);

        const newProject = {
          right: 'owner',
          projectId: saveProjectData._id,
          projectName: saveProjectData.name,
        }
        userExisted.projectsRight.push(newProject);
        await userExisted.save();

        res.status(200).json({ message: "Project created successfully", saveProjectData });

    } catch (error) {
        console.log("Error saving Project to database:", error);
        res.status(500).json({ message: "Error saving Project to database", error });
    }
  }),

  //!lists
lists: asyncHandler(async (req, res) => {
  const userExisted = await User.findById(req.user);

  // console.log('userExisted', userExisted)

  if (!userExisted) {
    return res.status(404).json({ message: "User not found" });
  }

  const userProjects = userExisted.projectsRight;
  const projectIds = userProjects.map((projRight) => projRight.projectId);

  const myProjects = await Project.find({
    '_id': { $in: projectIds }, // Only projects with ids in the user's projectsRight
  });

  // console.log('myProjects', myProjects)
  res.status(200).json({
    message: "Projects listed successfully",
    myProjects,
  });

  }),

deleteProject: asyncHandler(async (req, res) => {
  const projectExisist = await Project.findById(req.params.id);
  if (!projectExisist) {
      res.status(404).json({ message: "Project not found" });
      return;
  }
   // verify rights user have for project
  const userExisted = await User.findById(req.user);
  const userProjects = userExisted.projectsRight;
  const projectRight = userProjects.find((proj) => proj.projectName === projectExisist.name);

  if (!projectRight || projectRight.right !== 'owner') {
    return res.status(401).json({ message: "you don't have Ownership of this Project!" });
  }
  
 
  const projectBudgets = await Budget.find({ projectName: projectExisist.name });
  if (projectBudgets) {
    await Budget.deleteMany({ projectName: projectExisist.name });
  }

  const projectTransactions = await Transaction.find({ projectName: projectExisist.name });
  if (projectTransactions) {
    await Transaction.deleteMany({ projectName: projectExisist.name });
  }

  const projectReports = await Report.find({ projectName: projectExisist.name });
  if (projectReports) {
    await Report.deleteMany({ projectName: projectExisist.name });
  }
  
  const deletedProject = await Project.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Project deleted successfully", deletedProject });
}),

};

module.exports = projectController;
