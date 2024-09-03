const nodemailer = require('nodemailer');
const { verificationEmailTemplate, welcomeEmailTemplate } = require('./emailTemplates');

// Helper function to create a transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Function to send a verification email
const sendVerificationEmail = async (email, verificationToken) => {
  // 1) Create a transporter
  const transporter = createTransporter();

  // 2) Define the email options
  const mailOptions = {
    from: 'Majd Alhourani <majd.aldein.alhourani@gmail.com>',
    to: email,
    subject: 'Email Verification',
    html: verificationEmailTemplate.replace('{{VERIFICATION_CODE}}', verificationToken),
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

// Function to send a welcome email
const sendWelcomeEmail = async (email, name) => {
  // 1) Create a transporter
  const transporter = createTransporter();

  // 2) Define the email options
  const mailOptions = {
    from: 'Majd Alhourani <majd.aldein.alhourani@gmail.com>',
    to: email,
    subject: 'Welcome to Our Service!',
    html: welcomeEmailTemplate.replace('{{USER_NAME}}', name),
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};
