
const nodemailer = require("nodemailer");
require('dotenv').config();

async function main() {
    console.log("Testing Email Sending (JS)...");

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error("❌ ERROR: SMTP_USER or SMTP_PASSWORD not found in environment variables.");
        return;
    }

    console.log("User:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        console.log("Attempting to send...");
        const info = await transporter.sendMail({
            from: '"ZakatKita Test" <' + process.env.SMTP_USER + '>',
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from ZakatKita (JS)",
            text: "If you receive this, your SMTP configuration is working!",
            html: "<b>If you receive this, your SMTP configuration is working!</b>",
        });

        console.log("✅ SUCCESS: Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ FAILURE: Error sending email:", error);
    }
}

main();
