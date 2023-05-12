const mongoose = require("mongoose");

const schema = mongoose.Schema;

const accountSchema = new schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required : true ,
  },
  Password: {
    type: String,
    require: true,
  },
  totalAchievements: {
    type: Number,
    default: 0,
    },
    date: {
        type: Date,
        default:new Date()
  },
  verified: {
    type: Boolean,
    default: false 
    }
});

const Accounts = mongoose.model("accounts", accountSchema);

module.exports = Accounts;
