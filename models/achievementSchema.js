const mongoose = require('mongoose')

const schema = mongoose.Schema

const achievementSchema = new schema({

    title: {
        type: String,
        
    },
    date: Date,  
    userId: String,
    week:Number
})

const Achievement = mongoose.model("Achievements", achievementSchema);

module.exports = Achievement