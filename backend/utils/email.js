// ============================================================
// Email Utility - Nodemailer setup
// ============================================================
const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'EventFlow <noreply@eventflow.com>',
    to: email,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text fallback
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

module.exports = { sendEmail };
