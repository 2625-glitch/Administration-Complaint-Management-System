const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // e.g., 'Gmail'
            auth: {
                user: 'eighthavatarofvishnu8@gmail.com',
                pass: 'molemuddwdmcakkg',
            },
            port: 587,  // Use port 587 for SMTP with TLS
        });
        console.log("anitha")
        const mailOptions = {
            from: 'eighthavatarofvishnu8@gmail.com',
            to,
            subject,
            text,
        };
        console.log("mailoptions crossed")
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error for handling in the route
    }
}

module.exports = sendEmail;
