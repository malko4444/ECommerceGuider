import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Product Management App" <${process.env.MAIL_FROM}>`,
      to,
      subject: "Your OTP Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2e86de;">${otp}</h1>
        <p>This code will expire in <b>5 minutes</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Email sending failed");
  }
};
