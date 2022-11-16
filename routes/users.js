var express = require("express");
var router = express.Router();

const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const { db } = require("../mongo");

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

router.get("/all", async (req, res, next) => {
  try {
    const users = await db().collection("users").find({}).toArray();
    // console.log(users);
    res.json({
      success: true,
      users: users,
    });
  } catch (err) {
    console.log(err.name);
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // generating a new salt with the bcrypt genSalt function
    const saltRounds = 1;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    //generating a hashed password using the bcrypt hash function

    const user = {
      email: email,
      password: passwordHash,
      id: v4(),
    }; //creating a user in the db

    const addUser = await db().collection("users").insertOne(user);
    console.log(addUser);

    res.json({
      success: true,
      users: user,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await db().collection("users").findOne({
      email: email,
    });

    //if a user with this email address was not found in the database, the route should respond with a success: false object
    if (!user) {
      res
        .json({
          success: false,
          message: "Could not find user.",
        })
        .status(204);
      return;
    }

    //bcrypt compare takes two arguments, the first is the input plain text password and the second is the hashed password that is being stored on the user document. The compare function returns a boolean which will be true of the passwords match and false if they do not
    const match = await bcrypt.compare(password, user.password);

    //If the bcrypt compare function returned false, the route should respond with a success: false object
    if (!match) {
      res
        .json({
          success: false,
          message: "Password was incorrect.",
        })
        .status(204);
      return;
    }

    //boolean to check if user is admin or a regular user
    const userType = email.includes("codeimmersives.com") ? "admin" : "user";

    const userData = {
      date: new Date(),
      userId: user.id,
      scope: userType,
    };

    const exp = Math.floor(Date.now() / 1000) + 60 * 60; //numerical value in seconds of 24 hours
    const payload = {
      userData: userData,
      exp: exp,
    };

    // Use the jwt.sign method to create a new JSON Web Token and assign that value to a variable called token. jwt.sign takes two arguments, the first is the payload object you just created (with userData and exp), the second is the JWT_SECRET_KEY environment variable that you should access from process.env.
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(payload, jwtSecretKey);

    res.json({ success: true, token: token, email: email });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.get("/message", async (res, req) => {
  const tokenHeaderKey = process.env.TOKEN_HEADER_KEY; //user's token from the env variable
  const token = req.header(tokenHeaderKey); //user's token from the request headers

  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const verifiedToken = jwt.verify(token, jwtSecretKey);
  console.log(verified);

  const userData = verified.userData;
  
  if (!verifiedToken) {
    res.json({
      success: false,
      message: "ID Token could not be verified",
    });
  }
  if (userData && userData.scope === "user") {
    return res.json({
      success: true,
      message: "I am a normal user",
    });
  }

  if (userData && userData.scope === "admin") {
    return res.json({
      success: true,
      message: "I am an admin user",
    });
  }
});

module.exports = router;
