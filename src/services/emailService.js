const nodemailer = require('nodemailer');

// Configure the transporter with Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send confirmation email
exports.sendConfirmationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/api/auth/confirm/?token=${encodeURIComponent(token)}`;
  // const url = `http://localhost:3000/api/auth/confirm/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Confirm Your Email',
    html: `
      <p>Thank you for registering!</p>
      <p>Please confirm your email by clicking the link below:</p>
      <a href="${url}">Confirm Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send confirmation email.');
  }
};