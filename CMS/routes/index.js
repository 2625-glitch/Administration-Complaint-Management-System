const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const sendEmail = require('./email');
const bcrypt = require('bcryptjs'); // Add this line for importing bcrypt

let User = require('../models/user');
let Complaint = require('../models/complaint');
let OTP=require('../models/code');
router.get('/changeStatus',(req,res)=>{
    res.render('login');
})
// Home Page - Dashboard
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('index');
});
router.get('/changePassword',(req,res)=>{
    res.render('changePassword')
})
router.get('/forgotpassword',(req, res) => {
    res.render('forgotpassword'); // Create a forgetpassword.handlebars view for this route
  });
router.get('/index',ensureAuthenticated,(req,res)=>{
    res.render('index')
})
// Login Form
router.get('/login', (req, res, next) => {
    res.render('login');
});
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
        username: req.user.username,
        email:req.user.email ,
        name:req.user.name,
        role:req.user.role,
    });
});
router.get('/otp', async (req, res) => {
    res.render('otp',{
        username:req.session.username,
    })
});
// router.get('/otp',(req,res)=>{
//     res.render('otp', {
//         username: username,
//         OTP: OTP,
//     });
// })
router.get('/otp',(req,res)=>{
    res.render('otp')
})
router.get('/updateProfile',ensureAuthenticated,(req,res)=>{
    res.render('updateProfile')
})
router.get('/resetpassword', ensureAuthenticated, (req, res) => {
    res.render('resetpassword', {
        username: req.user.username,
    });
});
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

  res.render('contactus',{
    // username: req.user.username,
  });
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
});


router.post('/updateProfile', async(req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    // const role = req.body.role;
    const username=req.session.username;
    //checking with expresss validations
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    
    // req.checkBody('role', 'Role option is required').notEmpty();
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
                res.redirect('/profile');
            }
    catch (error) { 
        
        console.log('error',error.message)
        // req.flash('error_msg', error.message);
        // res.redirect('/index');
    }
    }
});



router.post('/resetpassword', ensureAuthenticated, async (req, res) => {
    const username = req.user.username;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    
    req.checkBody('currentPassword', 'Current password field is required').notEmpty();
    req.checkBody('newPassword', 'New password field is required').notEmpty();
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.newPassword);
    const errors = req.validationErrors();
    
    if (errors) {
        // Handle validation errors here
        return res.render('resetPassword', {
            errors: errors
        });
    }
    
    try {
        const user = await User.findOne({ username: username });
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/resetpassword');
        }
        
        const isMatch = await User.comparePasswords(currentPassword, user.password);
        
        if (!isMatch) {
            req.flash('error_msg', 'Current password is incorrect');
            return res.redirect('/resetpassword');
        }
        const isduplicate=await User.comparePasswords(newPassword,user.password);
        if(isduplicate){
            req.flash('error_msg','Old Password and New Password cannot be same');
            return res.redirect('/resetpassword');
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;

        try {
            await user.save();
            req.flash('success_msg', 'Password successfully changed');
            return res.redirect('/profile');
        } catch (error) {
            console.error('Error saving user:', error);
            req.flash('error_msg', 'An error occurred while saving the new password');
            return res.redirect('/resetpassword');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        req.flash('error_msg', 'An error occurred while resetting your password');
        return res.redirect('/resetpassword');
    }
});

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

router.post('/otpCheck',async(req,res)=>{
    // router.post('/otpCheck', async (req, res) => {
    const enteredOTP = req.body.otp; // OTP entered by the user
    // const newPassword=req.body.newPassword;
    const storedUsername = req.session.forgotPasswordUsername;
    console.log('storedPassword='+storedUsername)
    try {
        const otpRecord = await OTP.findOne({ username: storedUsername });
        if(otpRecord)
        {
            console.log('otpRecord:', otpRecord);

            console.log('username='+otpRecord.username)
            console.log(otpRecord.otp)
            if(otpRecord.otp!=enteredOTP)
            {
                req.flash('error_msg','Wrong OTP')
                return res.redirect('/forgotPassword')
            }
            await OTP.deleteOne({ username: storedUsername });
            return res.redirect('/changePassword')
        }
        // const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        if (!otpRecord) {
            console.log('Username not found');
            req.flash('error_msg','Wrong Username');
            return res.redirect('/forgotPassword');
            // res.status(404).send('OTP not found');

        }
        // The OTP record was found, you can access the associated username
        const username = otpRecord.username;
        // console.log(otpRecord.otp)
        
        // console.log('User found with username:', username);
        // const user = await User.findOne({ username: username });
        // if(!user)
        // {
        //     console.log('username does not exists')
        //     req.flash('error_msg', 'Username does not exist');
        //     return res.redirect('/forgotpassword');
        // }
        // user.password = hashedNewPassword;
        // await user.save();

        // // Now the user's password has been updated
        // console.log('Password updated successfully');
        // await OTP.deleteOne({ username: username });
        // res.redirect('/login')
        // // Now you can use the `username` variable as needed
        // // For example, you can render a success page or perform other actions
        
    } catch (error) {
        console.error('Error checking OTP:', error);
        res.status(500).send('Internal Server Error');
        req.flash('error_msg','wrong OTP')
        res.redirect('/forgotPassword')
    }
});
router.post('/otp', async (req, res) => {
    try {
        // Access the username from the session
        const username = req.session.username;

        if (!username) {
            // Handle the case where the username is not available in the session
            return res.status(404).send('Username not found in session');
        }

        // Now you can use the `username` variable as needed

        // You can also retrieve the corresponding OTP from the database
        const otpRecord = await OTP.findOne({ username: username });

        if (!otpRecord) {
            // Handle the case where the OTP record doesn't exist
            return res.status(404).send('OTP record not found');
        }

        const otp = otpRecord.otp;

        // Now you can use the `otp` variable as needed
        res.render('otp', {
            username: username,
            otp: otp,
        });
    } catch (error) {
        // Handle any errors that may occur during the database query or session access
        console.error('Error fetching OTP:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/forgotpassword',async(req,res)=>{
    const username=req.body.username
    req.session.forgotPasswordUsername = username; // Store the username in the session

    // const email=req.body.email
    console.log(username)
    const user = await User.findOne({ username: username });
    if(!user)
    {
        console.log('username does not exists')
        req.flash('error_msg', 'Username does not exist');
        return res.redirect('/forgotpassword');
    }
    else{
        const otpRecord = await OTP.findOne({ username: username });
        if(otpRecord)
        {
            await OTP.deleteOne({ username: username });
        }
        const email=user.email
        console.log(email)
        function generateVerificationCode() {
            const codeLength = 6;
            const characters = '0123456789';
            let code = '';
          
            for (let i = 0; i < codeLength; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              code += characters.charAt(randomIndex);
            }
          
            return code;
          }
          try{
          const verificationCode = generateVerificationCode();
         
          const newOTP = new OTP({
            username: username ,
            otp:verificationCode,
        });
        OTP.newOTP(newOTP, async(err, otp) => {
            if (err) throw err;
            // req.flash('success_msg', 'You have successfully launched a complaint');
            // console.log(user.name);
            // res.redirect('/register');
        })
        var adminEmail = email; // Replace with actual admin email
        var subject = 'Verification Code';
        var text = `Your CMS Verification Code is: ${verificationCode}\n`;
        try {
            await sendEmail(adminEmail, subject, text);
            console.log("ani")
            req.flash('success_msg', 'Email Sent');
            res.redirect('/otp');
        } catch (emailError) {
            console.error('Error while sending your email:', emailError);
            req.flash('error_msg', 'Error sending email to the admin');
            res.redirect('/forgotpassword');
        }

    }catch(err)
    {
        res.redirect('/forgotpassword')
    }
    }
})
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

        // Update the password for a user with a specific username
router.post('/changePassword', async (req, res) => {
    const username = req.session.forgotPasswordUsername;
    const newPassword = req.body.newPassword;
    const confirmPassword=req.body.confirmPassword;
    req.checkBody('newPassword', 'New password field is required').notEmpty();
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.newPassword);
    const errors = req.validationErrors();
    
    if (errors) {
        // Handle validation errors here
        return res.render('changePassword', {
            errors: errors
        });
    }
    
    console.log(username)
    // Check if the username is 'ani' (you can replace 'ani' with the specific username you want)
        try {
            const user = await User.findOne({ username: username });

            if (!user) {
                req.flash('error_msg', 'User not found');
                return res.redirect(`/changePassword`);
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            // Update the user's password with the new password
            user.password = hashedNewPassword;
            
            // Save the updated user object
            await user.save();

            req.flash('success_msg', 'Password updated successfully');
            return res.redirect('/login'); // Redirect to the profile page or any other appropriate page
        } catch (error) {
            console.error('Error updating password:', error);
            req.flash('error_msg', 'An error occurred while updating the password');
            return res.redirect(`/changePassword`);
        }
});

module.exports = router;
// Start Server