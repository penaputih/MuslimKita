"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export async function register(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Semua data wajib diisi." };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "Email sudah terdaftar." };
        }

        const hashedPassword = await hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "MEMBER",
                isVerified: false,
                verificationCode: code,
                verificationCodeExpires: expires
            },
        });

        const { sendVerificationEmail } = await import("@/lib/mail");
        await sendVerificationEmail(email, code);

    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Gagal mendaftar. Silahkan coba lagi." };
    }

    redirect(`/verify?email=${encodeURIComponent(email)}`);
}
