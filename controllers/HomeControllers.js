const Achievement = require("../models/achievementSchema");

const showAchievement = (req, res, next) => {
  Achievement.find({ userId: req.userId })
    .then((result) => {
      let weekNumber = 1;
      let resObj = result;
      let fromDate = new Date(req.userDate);

      let toDate = new Date();
      let difference = toDate.getTime() - fromDate.getTime();

      let numberOfWeeks =
        Math.ceil(difference / (1000 * 3600 * 24) / 7);

      // console.log("from " + fromDate.getTime());
      // console.log("to " + toDate.getTime());
      
      try {
        toDate = new Date(
          toDate.setTime(fromDate.getTime() + 1 * 7 * 24 * 60 * 60 * 1000)
        );
        fromDate = fromDate.getTime();
        toDate = toDate.getTime();
        for (let i = 0; i < numberOfWeeks; i++) {
            
          resObj.forEach((element) => {
            let elementDate = new Date(element.date).getTime();
             console.log("from " + new Date(fromDate));
             console.log("to " + new Date(toDate));
             console.log("element " + new Date(elementDate));

            if (elementDate >= fromDate && elementDate <= toDate) {
              
              element.week = i + 1;
              
            }
          });
            toDate = toDate + 7 * 24 * 60 * 60 * 1000;
            fromDate = fromDate + 7 * 24 * 60 * 60 * 1000;
          }

        var groupByWeek = resObj.reduce((acc, obj) => {
          const key = obj.week;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});
          
          //console.log(groupByWeek);
      } catch (err) {
        console.log(err);
      }

      

      //console.log(numberOfWeeks);

      //fromDate = fromDate.getTime();
        try {
            res.render("index", {
              title: "Home",
              data: groupByWeek,
              userName: req.userName,
              userId: req.Id,
              weeks: numberOfWeeks,
            });
        } catch (err)
        {
            console.log(err)
        }

      
    })
    .catch((err) => {
      res.json(err);
    });
};

const addAchievement = (req, res, next) => {
  let data = req.body;
  data.date = new Date();
  data.userId = req.userId;
  let achievement = new Achievement(data);

  achievement
    .save()
    .then((result) => {
      console.log("Achievement Add ! " + data.numberOfWeeks);
      res.redirect("/Home");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { showAchievement, addAchievement };
