const express = require("express");
const app = express();
require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const Achievement = require("./models/achievementSchema");
const ip = "localhost";
const homeControllers = require("./controllers/HomeControllers");
const authenticateMidd = require("./middleware/authenticate");
const authControllers = require("./controllers/authControllers");
const cookieParser = require("cookie-parser");
const Userverification = require("./models/verifyaccountsSchema");
const User = require("./models/accountsSchema");
app.use(cookieParser());
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require('express-session')

app.use(session({
  resave: false, 
  saveUninitialized : true ,
  secret: 'SECRET'
}))

mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT, () => {
      console.log(`App listening at http://${ip}:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.redirect("/Home");
});

app.get("/Home", authenticateMidd, homeControllers.showAchievement);

app.get("/add-new-Achievement", authenticateMidd, (req, res) => {
  res.render("add-new-Achievement", {
    title: "Add new Achievement",
    userName: req.userName,
    userId: req.Id,
  });
});

app.post("/add-Achievement", authenticateMidd, homeControllers.addAchievement);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", authControllers.login);

app.post("/register", authControllers.register);

app.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/login");
});

app.get("/user/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;
  console.log(uniqueString);
  Userverification.find({ userId })
    .then((result) => {
      if (result.length) {
        console.log(result);
        const { expireAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        console.log(hashedUniqueString);
        if (expireAt < Date.now()) {
          Userverification.deleteOne({ _id: userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then((result) => {
                  console.log("link has expired please sign up again");
                })
                .catch((err) => {
                  console.log(err);
                });
              console.log("deleted verification successfully");
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          bcrypt
            .compare(uniqueString, hashedUniqueString, (err, result) => {
              if (err)
              {
                console.log("error why compare");
              }
              else {
                
                if (result) {
                  User.updateOne(
                    { _id: userId },
                    { verified: true },
                    { new: true }
                  )
                    .then((result) => {
                      Userverification.deleteOne({ _id: userId })
                        .then((result) => {
                          console.log("the email is verified");
                          res.redirect("/login");
                        })
                        .catch((err) => {
                          console.log("error while deleting verification");
                        });
                    })
                    .catch((err) => {
                      console.log("couldnt update verified");
                    });
                } else {
                  console.log("incorrect verification");
                }
              }
            })
            
        }
      } else {
        console.log("couldnt find Userverification or already verified");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/Contact", (req, res) => {
  res.render("contact")
  
}
);

app.post("/Contact" , homeControllers.sendContact)

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());



app.get('/success', (req,res,next) => {
  authControllers.otherRegister(req, res, next, userProfile);
}
);
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://achievements-lister.onrender.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    
    res.redirect('/success');
  });

  app.use((req, res) => {
    res.status(404).send("Sorry can't find that!");
  });
  