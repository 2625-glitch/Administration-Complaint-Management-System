const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
// const cors=require('cors');

const app = express();

const port = process.env.PORT || 9002;
// app.use(cors());
let Complaint = require('./models/complaint');
const index = require('./routes/index');
const { compareSync } = require('bcryptjs');

// View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    maxAge: null,
    cookie : { httpOnly: true, maxAge: 2419200000 } // configure when sessions expires
}));


// Init passport
app.use(passport.initialize());
app.use(passport.session());

// Express messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use('/', index);


app.put('/changeStatus',async(req,res)=>{
  // console.log("hello world");
  console.log(req.body);
  const complaintId=req.body.complaintId;
   const status=req.body.status;
   console.log(complaintId);
   try{
    // console.log("y");
       const complaint=await Complaint.findById('64ee42d5e6c5792e4c9e5b84');
      // complaint='64ee42d5e6c5792e4c9e5b84';
      // console.log("c"+complaint+"c");
      if(!complaint) return res.status(400).send("Complaint not found");
      console.log(complaint);
      const blockname=complaint.blockname;
      const complainttype=complaint.complainttype;
      const contact=complaint. contact;
      const desc=complaint.desc;
      const username=complaint.username;
      const updatedComplaint=await Complaint.findByIdAndUpdate(
          complaintId,
          {blockname,complainttype,contact,desc,username,status},
          {new:true}
      );
      console.log("updated",updatedComplaint);
      res.status(200)
   }
   catch(error)
   {
      res.status(400).json({error:error})
   }})
app.listen(port, () => {
  console.log('Server started on port '+port);
});
