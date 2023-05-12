const User = require("../models/accountsSchema");
const Userverification = require("../models/verifyaccountsSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");

const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS_APP,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log("ready for messages");
    console.log(success);
  }
});

const sendVerificationEmail = ({ _id, Email }, res) => {
  const currentUrl = "https://achievements-lister.onrender.com";
  const uniqueString = uuidv4() + _id;

  console.log(uniqueString);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: Email,
    subject: "Verify your Email",
    html: `<p>Verify your email address to complete the signup and login into your account. </p> <p>
    this link <b>expires in 6 hours </b> . </p> <p>Press <a href=${
      currentUrl + "/user/verify/" + _id + "/" + uniqueString
    }>here</a> to proceed. </p>`,
  };

  bcrypt.hash(uniqueString, 10, (err, hashedUniqueString) => {
    if (err) {
      res.json({
        status: "failed",
        message: "an error occurred while hashing email data !",
      });
    } else {
      const newVerification = new Userverification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expireAt: Date.now() + 21600000,
      });
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.json({
                status: "pending",
                message: "verification email sent",
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "failed",
                message: "verification email failed",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "failed",
            message:
              "an error occurred while saving verification email   data !",
          });
        });
    }
  });
};

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
          Email: req.body.Email,
        });
        user
          .save()
          .then((result) => {
            sendVerificationEmail(result, res);

            //res.redirect("/login");
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
        if (!user.verified) {
          res.json({
            status: "failed",
            message: "User is not verified",
          });
        } else {
          bcrypt.compare(
            req.body.Password,
            user.Password,
            function (err, result) {
              if (err) {
                res.json({
                  error: err,
                });
              }
              if (result) {
                let token = jwt.sign(
                  { Id: user.id, Name: user.Name, Date: user.date },
                  process.env.SECRET_KEY,
                  {
                    expiresIn: "1h",
                  }
                );

                res.cookie("token", token, { httpOnly: true });
                res.redirect("/Home");
                // res.json({
                //     message: 'login successfully !' ,
                //     token:token

                // })
              } else {
                res.json({
                  message: "password does not matched !",
                });
              }
            }
          );
        }
      } else {
        res.json({
          message: "no user found !",
        });
      }
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports = { register, login };
