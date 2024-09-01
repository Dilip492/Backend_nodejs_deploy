const GoogleStrategy = require("passport-google-oauth20").Strategy;

const passport = require("passport");
const jwt = require("jsonwebtoken");

// const Usermodel = require('../models/user');
const gUser = require("../models/Guser");

require("dotenv").config();

const generateToken = (user) => {

  const payload = {
    userId: {
      id: user.id,
    },
  };

  const token = jwt.sign(payload, process.env.jwtsecret);

  return token;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
      ? 'https://backend-nodejs-deploy-1.onrender.com/auth/google/callback' 
      : 'http://localhost:5000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, cb) => {
      const newUser = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      try {
        let user = await gUser.findOne({ googleId: newUser.googleId });

        if (!user) {
          user = new gUser(newUser);
          await user.save();
        }

        const token = generateToken(user);

        console.log(user, token)

        return cb(null, {user,token });
      } catch (error) {
        console.log(error);
      }
    }
  )
);
// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
