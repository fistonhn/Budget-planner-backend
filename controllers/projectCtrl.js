const asyncHandler = require("express-async-handler");
const Project = require("../model/Project");
const User = require("../model/User");

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

  // Get the user's project rights (projects the user has access to)
  const userProjects = userExisted.projectsRight;

  // Get the project ids from the user's project rights
  const projectIds = userProjects.map((projRight) => projRight.projectId);

  // Find all projects that have a name that exists in the user's project rights
  const myProjects = await Project.find({
    '_id': { $in: projectIds }, // Only projects with ids in the user's projectsRight
  });

  // console.log('myProjects', myProjects)
  res.status(200).json({
    message: "Projects listed successfully",
    myProjects,
  });

  }),

};

module.exports = projectController;
