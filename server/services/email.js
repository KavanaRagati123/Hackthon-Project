const nodemailer = require('nodemailer');
const { logger } = require('../middleware/errorHandler');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn('Email not configured - skipping email send to ' + to);
      console.log(`📧 [EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      return { mock: true, message: 'Email service not configured' };
    }

    const info = await transporter.sendMail({
      from: `"MindMate" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    console.log(`📧 [EMAIL FAILED] To: ${to} | Subject: ${subject}`);
    return { error: true, message: error.message };
  }
};

const sendWelcomeEmail = (to, name) => {
  return sendEmail(to, 'Welcome to MindMate! 🧠💚', `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #6366F1 0%, #10B981 100%); padding: 2px; border-radius: 16px;">
      <div style="background: #111827; border-radius: 14px; padding: 40px;">
        <h1 style="color: #F9FAFB; font-size: 28px; margin-bottom: 16px;">Welcome to MindMate, ${name}! 🎉</h1>
        <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6;">
          Your private mental health companion is ready. Remember, it's okay to not be okay – and we're here for you, anytime, anywhere.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; border-left: 4px solid #6366F1;">
          <p style="color: #C7D2FE; font-size: 14px; margin: 0;">💬 Chat with our AI companion<br>📅 Book counselling sessions<br>📊 Track your well-being<br>👥 Connect with peers</p>
        </div>
        <p style="color: #6B7280; font-size: 14px;">Take care of yourself 💚<br>– The MindMate Team</p>
      </div>
    </div>
  `);
};

const sendAppointmentConfirmation = (to, name, dateTime, counsellorName) => {
  const date = new Date(dateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return sendEmail(to, 'Appointment Confirmed – MindMate 📅', `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 40px;">
      <h2 style="color: #F9FAFB;">Appointment Confirmed ✅</h2>
      <p style="color: #9CA3AF;">Hi ${name}, your appointment is confirmed:</p>
      <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 12px; margin: 16px 0;">
        <p style="color: #10B981; margin: 0;"><strong>Counsellor:</strong> ${counsellorName}<br><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}</p>
      </div>
      <p style="color: #6B7280; font-size: 14px;">You'll receive a reminder 1 hour before your session.</p>
    </div>
  `);
};

const sendOTP = (to, otp) => {
  return sendEmail(to, 'Verify Your Email – MindMate', `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 40px; text-align: center;">
      <h2 style="color: #F9FAFB;">Verify Your Email</h2>
      <p style="color: #9CA3AF;">Your verification code is:</p>
      <div style="font-size: 36px; font-weight: bold; color: #6366F1; letter-spacing: 8px; margin: 24px 0;">${otp}</div>
      <p style="color: #6B7280; font-size: 14px;">This code expires in 10 minutes.</p>
    </div>
  `);
};

module.exports = { sendEmail, sendWelcomeEmail, sendAppointmentConfirmation, sendOTP };
