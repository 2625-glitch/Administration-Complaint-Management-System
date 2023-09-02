const mongoose = require('mongoose')
const dbconnect = require('../db')

//Call the db to connect the mongo db
dbconnect()

// Complaint Schema
const OTPSchema = mongoose.Schema({
    username: {
        type: String
    },
   otp:{
    type:Number
   },
});

const OTP = module.exports = mongoose.model('OTP', OTPSchema);

module.exports.newOTP = function (newOTP, callback) {
    newOTP.save(callback);
}
  // Start Server
  