const express = require("express");
const app = express();
const port = 8080;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const Achievement = require("./models/achievementSchema");
const ip = "localhost";
const homeControllers = require('./controllers/HomeControllers') 
const authenticateMidd = require('./middleware/authenticate')
const authControllers = require('./controllers/authControllers')
const cookieParser = require("cookie-parser");

app.use(cookieParser());
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://amr006:amr2011@cluster0.jjgvauh.mongodb.net/Achievement?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(port, () => {
      console.log(`App listening at http://${ip}:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.redirect("/Home");
});


app.get("/Home", authenticateMidd , homeControllers.showAchievement);

app.get("/add-new-Achievement", authenticateMidd, (req, res) => {
  res.render("add-new-Achievement", {
    title: "Add new Achievement", userName :req.userName ,
    userId: req.Id,
  });
});

app.post("/add-Achievement", authenticateMidd ,homeControllers.addAchievement);

app.get("/login", (req, res) => {
  res.render('login')
  
}
)

app.get('/register', (req, res) => {
  
  res.render('register')
  
}
)

app.post("/login", authControllers.login);

app.post("/register" , authControllers.register);

app.get("/logout", (req, res) => {
  res.clearCookie("token")
  .redirect('/login')
  
}
)

app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});
