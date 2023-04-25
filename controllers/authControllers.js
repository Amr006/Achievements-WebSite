const User = require("../models/accountsSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const register = (req, res, next) => {
  User.findOne({ Name: req.body.Name }).then((result) => {
    if (result) {
      res.json({
        message: "Username already exists ! ",
      });
    } else {
      bcrypt.hash(req.body.Password, 10, function (err, hashedPass) {
        if (err) {
          
          res.json({
            error: err,
          });
        }

        let user = new User({
          Name: req.body.Name,
          Password: hashedPass,
        });
        user
          .save()
          .then((user) => {
            res.redirect("/login");
          })
          .catch((error) => {
            res.json({
              message: "An error occured ! ",
            });
          });
      });
    }
  });
};

const login = (req, res, next) => {
  console.log(req.body);
  User.findOne({ Name: req.body.Name })
  .then((user) => {
    if (user) {
      bcrypt.compare(req.body.Password, user.Password, function (err, result) {
          if (err) {
            
          res.json({
            error: err,
          });
        }
        if(result) {
          
          let token = jwt.sign({Id : user.id , Name: user.Name , Date : user.date}, "NeversayNever", {
            expiresIn: "1h",
          });

          res.cookie('token', token, { httpOnly: true });
          res.redirect('/Home');
          // res.json({
          //     message: 'login successfully !' ,
          //     token:token

          // })
        } else {
          res.json({
            message: "password does not matched !",
          });
        }
      });
    } else {
      res.json({
        message: "no user found !",
      });
    }
  })
      .catch((err) => {
          
      res.json(err)
    
  }
  )
};

module.exports = { register, login };
