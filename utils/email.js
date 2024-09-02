const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Majd Alhourani <majd.aldein.alhourani@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) ACTAULLY send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

// Transporter: is a service that will send the email becuase not Node.js that will send the email, a service such as gmail or mailtrap

// To use gmail: Activate `less secure app` option
