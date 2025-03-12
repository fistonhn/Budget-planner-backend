const asyncHandler = require("express-async-handler");
const Report = require("../model/Report");

const reportController = {

  //!lists
  listsByProject: asyncHandler(async (req, res) => {
    const myReports = await Report.find({ projectName: req.body.projectName });
    
    res.status(200).json({ message: "Reports listed successfully", myReports });

  }),

};

module.exports = reportController;
