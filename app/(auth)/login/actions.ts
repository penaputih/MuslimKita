"use server";

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email dan password wajib diisi." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: "Akun belum terdaftar. Silahkan daftar terlebih dahulu." };
        }

        if (!user.password) {
            return { error: "Akun ini terdaftar menggunakan Google. Silahkan masuk dengan Google." };
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
            return { error: "Email atau password salah." };
        }

        if (!user.isVerified) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationCode: code,
                    verificationCodeExpires: expires
                }
            });

            const { sendVerificationEmail } = await import("@/lib/mail");
            await sendVerificationEmail(email, code);

            // We can't redirect from server action easily if we want to preserve state? 
            // Actually we can, but let's return a specific error/flag so the client can redirect? 
            // No, simple redirect works in nextjs actions usually.
            // But wait, replace_file_content replaces the block. returning redirect is fine.
        }

        if (!user.isVerified) {
            // Redirect helper
        }

        // Wait, I can't put redirect inside try/catch without it potentially being caught or having issues? 
        // Actually in Next.js server actions, redirect throws an error that Next catches. 
        // So I should do it carefully.

        if (!user.isVerified) {
            return { error: "REDIRECT_TO_VERIFY:" + email };
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        const session = await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, expires });

        (await cookies()).set("session", session, { expires, httpOnly: true });

        return { success: true, role: user.role };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Terjadi kesalahan saat login." };
    }
}
