import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config()

console.log(process.env.EMAIL_USER)
console.log(process.env.EMAIL_PASS)
const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string; }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

export default sendEmail;
