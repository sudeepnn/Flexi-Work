import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendParkingEndNotification = async (email: string, slotNumber: string, endTime: Date) => {
    // Log the email details before sending
    console.log(`Preparing to send email to: ${email}`);
    console.log(`Slot Number: ${slotNumber}`);
    console.log(`End Time: ${endTime}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Parking Time Ending Soon',
        text: `Dear user, your parking slot ${slotNumber} is set to end at ${endTime}. Please ensure to vacate or extend your booking.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}, Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
    }
};
