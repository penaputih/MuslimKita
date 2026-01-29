"use server";

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendVerificationEmail } from "@/lib/mail";

export async function verifyCode(email: string, code: string) {
    if (!email || !code) return { error: "Data tidak valid" };

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return { error: "User tidak ditemukan" };

        if (user.isVerified) {
            // Already verified, just login logic if needed or redirect
            return { success: true };
        }

        if (user.verificationCode !== code) {
            return { error: "Kode verifikasi salah" };
        }

        if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
            return { error: "Kode verifikasi telah kadaluarsa" };
        }

        // Verify user and clear code
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationCodeExpires: null,
            },
        });

        // Create Session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            },
            expires,
        });

        (await cookies()).set("session", session, { expires, httpOnly: true });

        return { success: true };

    } catch (error) {
        console.error("Verification error:", error);
        return { error: "Terjadi kesalahan sistem" };
    }
}

export async function resendCode(email: string) {
    if (!email) return { error: "Email wajib diisi" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { error: "User tidak ditemukan" };

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: code,
                verificationCodeExpires: expires,
            },
        });

        const sent = await sendVerificationEmail(email, code);
        if (!sent) return { error: "Gagal mengirim email" };

        return { success: true };
    } catch (error) {
        console.error("Resend error:", error);
        return { error: "Terjadi kesalahan sistem" };
    }
}
