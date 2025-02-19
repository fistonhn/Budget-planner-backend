const asyncHandler = require("express-async-handler");
const Project = require("../model/Project");

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

        
            const saveData = await projectData.save();
        
            res.status(200).json({ message: "Project created successfully", saveData });

        } catch (error) {
            console.error("Error saving Project to database:", error);
            res.status(500).json({ message: "Error saving Project to database", error });
        }
  }),

  //!lists
  lists: asyncHandler(async (req, res) => {
    const myProjects = await Project.find({user: req.user});
    
    res.status(200).json({ message: "Projects listed successfully", myProjects });

  }),

};

module.exports = projectController;
