import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.MAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true" || process.env.MAIL_ENCRYPTION === "ssl",
    auth: {
        user: process.env.SMTP_USER || process.env.MAIL_USERNAME,
        pass: process.env.SMTP_PASSWORD || process.env.MAIL_PASSWORD,
    },
});

export async function sendVerificationEmail(email: string, code: string) {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyLink = `${appUrl}/verify?email=${encodeURIComponent(email)}&code=${code}&auto=true`;

        const senderEmail = process.env.SMTP_USER || process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME;
        const info = await transporter.sendMail({
            from: `"Admin Majelis Daarussyifa" <${senderEmail}>`,
            to: email, // list of receivers
            subject: "Verifikasi Akun MuslimKita - Daarussyifa Apps", // Subject line
            text: `Klik link berikut untuk verifikasi: ${verifyLink}`, // plain text body
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #047857;">Verifikasi Akun</h2>
                    <p>Terima kasih telah mendaftar di MuslimKita. Silahkan klik tombol di bawah ini untuk memverifikasi akun Anda:</p>
                    <a href="${verifyLink}" style="background-color: #047857; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold;">
                        Verifikasi Akun Saya
                    </a>
                    <p style="font-size: 14px; color: #666;">Atau salin link ini ke browser anda:</p>
                    <p style="font-size: 12px; color: #888; word-break: break-all;">${verifyLink}</p>
                    <p style="font-size: 14px; margin-top: 30px;">Kode ini hanya berlaku selama 30 menit.</p>
                </div>
            `, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
