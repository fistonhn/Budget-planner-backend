const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Project = require("../model/Project");
const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey("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");

const sendProjectAssignmentEmail = async (userEmail, password, projectName, accessRight, isNewUser) => {
  console.log('sendProjectAssignmentEmail', userEmail, password, projectName, accessRight, isNewUser)
  const msg = {
    to: userEmail,
    from: 'hnfiston6@gmail.com',
    subject: `Welcome! Your Account and Project Access`,
    text: `Hello,

    You have been successfully assigned to the project.

    ${isNewUser ? `Your login details:
      Email: ${userEmail}
      Password: ${password || 'Your existing password remains unchanged.'}` : ''
   }

    You have been assigned ${accessRight} access to the project: ${projectName}.
    You can log in using the provided credentials and access the project accordingly.

    Regards,
    The Team`,
    html: `<strong>Hello,</strong><br><br>
    You have been successfully assigned to the project.<br><br>
    ${isNewUser ? `<b>Your login details:</b><br>
    Email: ${userEmail}<br>
    Password: ${password || 'Your existing password remains unchanged.'}<br><br>` : ''}
    You have been assigned ${accessRight} access to the project: ${projectName}.<br>
    You can log in using the provided credentials and access the project accordingly.<br><br>
    Regards,<br>
    The Team`,
  };

  try {
    await sendgrid.send(msg);
    console.log('The email sent successfully');
  } catch (error) {
    console.error('Error sending the email:', error.response.body);
  }
};


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

      if (!accessRight || !userEmail) {
        return res.status(400).json({ message: "All fields (accessRight, and userEmail) are required." });
      }
      // verify rights user have for project
      const myRight = await User.findById(req.user );
 
      const userProjects = myRight.projectsRight;
      const projectRight = userProjects.find((proj) => proj.projectName === projectName);

      if (!projectRight || projectRight.right !== 'owner') {
        return res.status(401).json({ message: "you don't have ownership of this Project!" });
      }

      let userExisted 
      const userFound = await User.findOne({ email: userEmail });


      if (!userFound) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userEmail, salt);
        const userCreated = await User.create({
          email: userEmail,
          username: userEmail,
          password: hashedPassword,
        });
        userExisted = userCreated

        await sendProjectAssignmentEmail(userEmail, userEmail, projectName, accessRight, true); // New user
      } else {
        userExisted = userFound
        await sendProjectAssignmentEmail(userEmail, null, projectName, accessRight, false); // Existing user
      }

          const existingProjectIndex = userExisted.projectsRight.findIndex(projRight => projRight.projectId === projectId);

          if (existingProjectIndex !== -1) {
            // console.log('myRight', userExisted.projectsRight[existingProjectIndex])

            if(userExisted.projectsRight[existingProjectIndex].right === 'owner') {
              return res.status(401).json({ message: "Project Owner has full access already!" });
            }

            userExisted.projectsRight[existingProjectIndex].right = accessRight;
            const updateUserPr = await userExisted.save();
            // console.log('updateUserPr',updateUserPr)

            return res.status(200).json({ message: "Project access updated successfully", user: userExisted });
          } else {
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
          res.status(500).json({ message: "Internal server error!", error });
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
