const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const passport = require("passport");
const jwt = require("jsonwebtoken");

const Usermodel = require("../models/user");

const verifyUserEmail = require("../nodemailer");

const userOTP = require("../models/userOTP");
const user = require("../models/user");

require("dotenv").config();

router.post("/register", async (req, res) => {
  const { name, email, phoneNo, password } = req.body;

  if (!name || !email || !password || !phoneNo) {
    return res
      .status(401)
      .json({ message: "Please provide all required credentials." });
  }
  try {
    const emailcheck = await Usermodel.findOne({ email: email });

    if (emailcheck) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const user = new Usermodel({ name, email, phoneNo, password: hashPass });

    await user.save();
    const payload = {
      userId: {
        id: user.id,
      },
    };
   
    const token = jwt.sign(payload, process.env.jwtsecret);
    const option = {
      httpOnly:true,
      secure:true
    }

    res.cookie("jwt", token, option);

    res.status(200).json({ user: user, Token: token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;       

  if (!email || !password) {
    return res
      .status(401)
      .json({ message: "Please provide all required credentials." });
  }

  try {

    const user = await Usermodel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "Incorrect email and password" });
    }

    const storedPass = user.password;


    const checkPass = await bcrypt.compare(password, storedPass);

    if (checkPass) {
      const payload = {
        userId: {
          id: user.id,
        },
      };
  
   
  
      const token = jwt.sign(payload, process.env.jwtsecret);

      console.log("This is token", token)
      const option = {
        httpOnly: true, 
        secure: true,
      };

      res.cookie("jwt", token, option).status(200)
      console.log("check token is set or not ", req.cookies.jwt)
     
      return res.status(200).json({ Token: token });
    } else {
      return res.status(400).json({ message: "Incorrect email and password" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server login error", error: error.message });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),

  (req, res) => {
    // On success, redirect to a URL with a token or success message

    console.log(req.user);

    if (req.user) {
      const { token } = req.user;
      const option = {
        httpOnly: true, 
        secure: true,
      };
      res.cookie("jwt", token, option);
      return res.redirect(`http://localhost:3000/popup`);
    }
    res.status(401).json({ message: "Authentication failed" });
  }
);

router.get("/protected-route", (req, res) => {
  

  const token = req.cookies.jwt;
  
  console.log("receive token : ", token);

  if (token) {
    jwt.verify(token, process.env.jwtsecret, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ message: "Forbidden" });
      }
      res.status(200).json({ message: "This is protected route", user });
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/logout", (req, res) => {
  const option = {
    httpOnly: true,
    secure: true,
  };
  const token = req.cookies.jwt
  console.log("before dlt", token)
  res.clearCookie("jwt", option);
  console.log("after dlt", token)

  res.status(200).json({ message: "user logout successfully" });
});

router.post("/verifyUser", async (req, res) => {
  const { name, email, phoneNo, password } = req.body;

  if (!name || !email || !password || !phoneNo) {
    return res
      .status(401)
      .json({ message: "Please provide all required credentials." });
  }

  try {
    const emailcheck = await Usermodel.findOne({ email: email });

    if (emailcheck) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.round(10000 * Math.random());
    console.log("Generated OTP:", otp);

    // Save OTP to database
    const userotp = new userOTP({ otp: otp });
    await userotp.save();

    // Create new user
    const newUser = new Usermodel({ name, email, phoneNo, password: hashPass });
    await newUser.save();

    // Send OTP to user (assuming verifyUserEmail sends the OTP)
    verifyUserEmail(email, otp);

    res.status(200).json({ message: "user account create successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post("/verifyOTP", async (req, res) => {
  const { OTP } = req.body;

  try {
    const otpverify = await userOTP.findOne({ otp: OTP });

    if (otpverify) {
      return res.status(200).json({ message: "OTP is correct." });
    } else {
      return res.status(400).json({ message: "OTP is incorrect." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const passport = require('passport');
// const jwt = require('jsonwebtoken');
// const Usermodel = require('../models/user');
// require('dotenv').config();

// router.post('/register', async (req, res) => {
//   const { name, email, phoneNo, password } = req.body;

//   if (!name || !email || !password || !phoneNo) {
//     return res.status(401).json({ message: 'Please provide all required credentials.' });
//   }

//   try {
//     const emailcheck = await Usermodel.findOne({ email: email });

//     if (emailcheck) {
//       return res.status(404).json({ message: 'Email already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashPass = await bcrypt.hash(password, salt);

//     const user = new Usermodel({ name, email, phoneNo, password: hashPass });
//     await user.save();

//     const payload = {
//       userId: {
//         id: user.id
//       }
//     };

//     const token = jwt.sign(payload, process.env.jwtsecret);
//     return res.status(200).json({ user, token });
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(401).json({ message: 'Please provide all required credentials.' });
//   }

//   try {
//     const user = await Usermodel.findOne({ email: email });

//     if (!user) {
//       return res.status(400).json({ message: 'Incorrect email and password' });
//     }

//     const checkPass = await bcrypt.compare(password, user.password);

//     if (checkPass) {
//       return res.status(200).json({ message: 'Successfully logged in' });
//     } else {
//       return res.status(400).json({ message: 'Incorrect email and password' });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: 'Server login error', error: error.message });
//   }
// });

// router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// router.get(
//   '/google/callback',
//   passport.authenticate('google', {
//     successRedirect: 'http://localhost:3000',
//     failureRedirect: 'http://localhost:3000/login',
//     session: false
//   })
// );

// module.exports = router;
