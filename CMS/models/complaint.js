const mongoose = require('mongoose')
const dbconnect = require('../db')

//Call the db to connect the mongo db
dbconnect()

// Complaint Schema
const ComplaintSchema = mongoose.Schema({
    blockname: {
        type: String
    },
    complainttype: {
        type: String
    },
    contact: {
        type: String
    },
    desc: {
        type: String
    },
    username:{
        type:String
    },
    status:{
        type:String
    }
});

const Complaint = module.exports = mongoose.model('Complaint', ComplaintSchema);

module.exports.registerComplaint = function (newComplaint, callback) {
    newComplaint.save(callback);
}

module.exports.getAllComplaints = function(callback){
    Complaint.find(callback);
  }
  // Start Server