import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Email Guider" <${process.env.MAIL_FROM}>`,
      to,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <b>${otp}</b></p>`,
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  }
};
