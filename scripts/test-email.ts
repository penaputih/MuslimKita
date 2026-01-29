
import nodemailer from "nodemailer";
require('dotenv').config();

async function main() {
    console.log("Testing Email Sending...");

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error("❌ ERROR: SMTP_USER or SMTP_PASSWORD not found in environment variables.");
        return;
    }

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
        const info = await transporter.sendMail({
            from: '"ZakatKita Test" <' + process.env.SMTP_USER + '>',
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from ZakatKita",
            text: "If you receive this, your SMTP configuration is working!",
            html: "<b>If you receive this, your SMTP configuration is working!</b>",
        });

        console.log("✅ SUCCESS: Message sent: %s", info.messageId);
        console.log("Check your inbox (" + process.env.SMTP_USER + ") for the test email.");
    } catch (error: any) {
        console.error("❌ FAILURE: Error sending email:", error);
        if (error.code === 'EwqUTH') {
            console.error("\nTIP: For Gmail, ensure you are using an 'App Password', not your main password.");
        }
    }
}

main();
