const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const sendEmail = require('./email');

let User = require('../models/user');
let Complaint = require('../models/complaint');
router.get('/changeStatus',(req,res)=>{
    res.render('login');
})
// Home Page - Dashboard
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('index');
});
router.get('/index',ensureAuthenticated,(req,res)=>{
    res.render('index')
})
// Login Form
router.get('/login', (req, res, next) => {
    res.render('login');
});
router.get('/profile',ensureAuthenticated, (req,res)=>{
    res.render('profile')
})

// Register Form
router.get('/register', (req, res, next) => {
    res.render('register');
    // res.render('register', { flash: req.flash() });
});
//about us
router.get('/about', (req, res) => {
  res.render('about');
});
//contact us
router.get('/contactus', (req, res) => {
  res.render('contactus');
});
// Logout
router.get('/logout', ensureAuthenticated,(req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

// Admin
router.get('/admin', ensureAuthenticated, (req,res,next) => {
    Complaint.getAllComplaints((err, complaints) => {
        if (err) throw err;
            res.render('admin/admin', {
                complaints : complaints,
            });
        
    });        
});




//Complaint
router.get('/complaint', ensureAuthenticated, (req, res, next) => {
    //console.log(req.session.passport.username);
    //console.log(user.name);
    res.render('complaint', {
        username: req.session.user,
    });
});

//Register a Complaint
router.post('/registerComplaint',ensureAuthenticated, async(req, res, next) => {

    const blockname = req.body.blockname;
    const complainttype = req.body.complainttype;
    const contact = req.body.contact;
    const desc = req.body.desc;
    const username=req.session.username;
    const email=req.session.email;
    const status='pending';
    console.log(username);
    console.log(email);
    const postBody = req.body;
    console.log(postBody);

     req.checkBody('blockname', 'blockname field is required').notEmpty();

    req.checkBody('contact', 'Contact field is required').notEmpty();
    req.checkBody('desc', 'Description field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('complaint', {
            errors: errors
        });
    } else {
        const newComplaint = new Complaint({
            blockname: blockname,
            complainttype: complainttype,
            contact: contact,
            desc: desc,
            username: username ,
            status:status
        });

        Complaint.registerComplaint(newComplaint, async(err, complaint) => {
            if (err) throw err;
            req.flash('success_msg', 'You have successfully launched a complaint');
            // console.log(user.name);
            res.redirect('/');
            // Send an email to the admin
        var adminEmail = 'b181241@rgukt.ac.in'; // Replace with actual admin email
        var subject = 'New Complaint Registered';
        var text = `A new complaint has been registered with the following details:\n
            Block name: ${blockname}\n
            Complaint type: ${complainttype}\n
            Contact: ${contact}\n
            Description: ${desc}\n`;

            
        try {
            await sendEmail(adminEmail, subject, text);
            console.log("ani")
            req.flash('success_msg', 'You have successfully launched a complaint and an email has been sent to the admin.');
            // res.redirect('/');
        } catch (emailError) {
            console.error('Error while sending your email:', emailError);
            req.flash('error_msg', 'Error sending email to the admin');
            res.redirect('/complaint');
        }

        var subject = 'Complaint Registration Successful';
        var text = `You have registered a complaintwith the following details:\n
            Block name: ${blockname}\n
            Complaint type: ${complainttype}\n
            Contact: ${contact}\n
            Description: ${desc}\n`;

            
        try {
            await sendEmail(email, subject, text);
            console.log("ani")
            req.flash('success_msg', 'You have successfully launched a complaint and an email has been sent to the admin.');
            // res.redirect('/');
        } catch (emailError) {
            console.error('Error while sending your email:', emailError);
            req.flash('error_msg', 'Error sending email to the admin');
            res.redirect('/complaint');
        }

        });
    }
});



// Process Register
router.post('/register', async(req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = req.body.role;
    //checking with expresss validations
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('role', 'Role option is required').notEmpty();
    
    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password,
            role: role
        });
        try{
            const foundUser = await User.findOne({ username });
            if (foundUser) {
                console.log("user alread present");
                req.flash('error_msg', 'Username already exists');
    res.redirect('/register');
            } else{
        User.registerUser(newUser, (err, user) => {
            req.flash('success_msg', 'You are Successfully Registered and can Log in');
            res.redirect('/login');
        });}
    }
    catch (error) {
        req.flash('error_msg', error.message);
        res.redirect('/register');
    }
}});



router.post('/updateProfile', async(req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const username=req.session.username;
    //checking with expresss validations
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    
    req.checkBody('role', 'Role option is required').notEmpty();
    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        try{
            foundUser = await User.findOne({ username: username });
            if(!foundUser)
            {
                console.log("cannot find user")
            }
                foundUser.name=name;
                foundUser.email=email;
                foundUser.save().then(()=>{

                })
                console.log("updated",foundUser)
                req.flash('success_msg', 'Your profile is updated')
                res.redirect('/index');
            }
    catch (error) { 
        
        console.log('error',error.message)
        // req.flash('error_msg', error.message);
        // res.redirect('/index');
    }
}});




// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return done(null, false, {
                message: 'No user found'
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Wrong Password'
                });
            }
        });
    });
}));


passport.serializeUser((user, done) => {
    var sessionUser = {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
    }
    done(null, sessionUser);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, sessionUser) => {
        done(err, sessionUser);
    });
});

// Login Processing
router.post('/login', passport.authenticate('local', 
    { 
        failureRedirect: '/login', 
        failureFlash: true 
    
    }), (req, res, next) => {
        req.session.username = req.user.username;
        req.session.email = req.user.email;
        req.session.save((err) => {
        if (err) {
            return next(err);
        }
        
        if(req.user.role==='admin'){
            res.redirect('/admin');
        }
        else{
            res.redirect('/');
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not Authorized to view this page');
        res.redirect('/login');
    }
}
router.get('/viewcomplaint', ensureAuthenticated, (req, res) => {
  Complaint.find({ username: req.sessoin.username }, (err, complaints) => {
    if (err) throw err;
    console.log(req.user); // Log the user object to the console for verification
    res.render('viewcomplaint', {
      complaints: complaints,
      user: req.user
    });
  });
});

router.get('/viewYourComplaints', ensureAuthenticated, (req, res) => {
    Complaint.find({ username: req.session.username }, (err, complaints) => {
      if (err) throw err;
      console.log(req.user); // Log the user object to the console for verification
      res.render('viewYourcomplaints', {
        complaints: complaints,
        user: req.user
      });
    });
  });
  
  
      router.get('/viewAllComplaints', ensureAuthenticated, (req, res) => {
          Complaint.find({}, (err, complaints) => { // Passing an empty object to find retrieves all documents
            if (err) throw err;
            console.log(req.user); // Log the user object to the console for verification
            res.render('viewAllComplaints', {
              complaints: complaints,
              user: req.user
            });
          });
        });
module.exports = router;
// Start Server