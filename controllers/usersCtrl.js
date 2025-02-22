const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Project = require("../model/Project");


const usersController = {
  //!Register
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new Error("Please all fields are required");
    }
    //!Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //! Create the user and save into db
    const userCreated = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    //! Send the response

    res.json({
      username: userCreated.username,
      email: userCreated.email,
      id: userCreated._id,
    });
  }),
  //!Login
  login: asyncHandler(async (req, res) => {
    //! Get the user data
    const { email, password } = req.body;
    //!check if email is valid
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid login credentials");
    }
    //! Compare the user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid login credentials");
    }
    //! Generate a token
    const token = jwt.sign({ id: user._id }, "masynctechKey", {
      expiresIn: "30d",
    });
    //!Send the response
    res.json({
      message: "Login Success",
      token,
      id: user._id,
      email: user.email,
      username: user.username,
    });
  }),

  // assign Project to user
  assignProject: asyncHandler(async (req, res) => {
    try {
      const assignData = req.body

      const projectName = assignData.projectName
      const projectId = assignData.projectId
      const accessRight = assignData.accessRight
      const userEmail = assignData.userEmail

      // Step 1: Validate the incoming data
      if (!accessRight || !userEmail) {
        return res.status(400).json({ message: "All fields (accessRight, and userEmail) are required." });
      }

      const userExisted = await User.findOne({ email: userEmail });
      if (!userExisted) {
        return res.status(404).json({ message: `User must have registed acount, ${userEmail} is Not registered!` });
      }

      // Check if the project already exists in the user's projectsRight array
          const existingProjectIndex = userExisted.projectsRight.findIndex(projRight => projRight.projectId === projectId);

          if (existingProjectIndex !== -1) {
            // If the project exists, update its accessRight
            userExisted.projectsRight[existingProjectIndex].right = accessRight;
            const updateUserPr = await userExisted.save();
            console.log('updateUserPr',updateUserPr)

            return res.status(200).json({ message: "Project access updated successfully", user: userExisted });
          } else {
            // If the project doesn't exist, add it to the projectsRight array
            const newProject = {
              right: accessRight,
              projectId: projectId,
              projectName: projectName,
            }
            userExisted.projectsRight.push(newProject);
            await userExisted.save();
            return  res.status(200).json({ message: `User Assigned Project(${projectName}) successfully` });
          }      
      } catch (error) {
          console.error("Error saving Project to database:", error);
          res.status(500).json({ message: "Error saving Project to database", error });
    }
  }),

  //!profile
  profile: asyncHandler(async (req, res) => {
    //! Find the user
    console.log(req.user);
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //!Send the response
    res.json({ username: user.username, email: user.email });
  }),
  //! Change password
  changeUserPassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    //! Find the user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //! Hash the new password before saving
    //!Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    //! ReSave
    await user.save({
      validateBeforeSave: false,
    });
    //!Send the response
    res.json({ message: "Password Changed successfully" });
  }),
  //! update user profile
  updateUserProfile: asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      {
        username,
        email,
      },
      {
        new: true,
      }
    );
    res.json({ message: "User profile updated successfully", updatedUser });
  }),
};

module.exports = usersController;
