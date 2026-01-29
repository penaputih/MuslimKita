
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idToken, intent } = body;

        if (!idToken) {
            return NextResponse.json({ error: "No ID Token provided" }, { status: 400 });
        }

        // Verify ID Token
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const googleUser = await verifyRes.json();

        if (verifyRes.status !== 200 || !googleUser.email) {
            return NextResponse.json({ error: "Invalid ID Token" }, { status: 401 });
        }

        // Find or Create User
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            if (intent === "register") {
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

                user = await prisma.user.create({
                    data: {
                        email: googleUser.email,
                        name: googleUser.name || googleUser.email.split("@")[0],
                        image: googleUser.picture,
                        isVerified: false,
                        verificationCode: code,
                        verificationCodeExpires: expires,
                        role: "MEMBER",
                        password: crypto.randomUUID(),
                    } as any,
                });

                const { sendVerificationEmail } = await import("@/lib/mail");
                await sendVerificationEmail(googleUser.email, code);

                return NextResponse.json({
                    success: true,
                    message: "Registration successful",
                    redirect: `/verify?email=${encodeURIComponent(googleUser.email)}`
                });

            } else {
                return NextResponse.json({ error: "Akun belum terdaftar. Silahkan daftar terlebih dahulu." }, { status: 400 });
            }
        }

        // Enforce verification structure check from callback
        if (!user.isVerified) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationCode: code,
                    verificationCodeExpires: expires
                } as any,
            });

            const { sendVerificationEmail } = await import("@/lib/mail");
            await sendVerificationEmail(user.email, code);

            return NextResponse.json({
                success: true,
                redirect: `/verify?email=${encodeURIComponent(user.email)}`
            });
        }

        // Update image if needed
        if (googleUser.picture && user.image !== googleUser.picture) {
            await prisma.user.update({
                where: { id: user.id },
                data: { image: googleUser.picture }
            });
        }

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

        return NextResponse.json({ success: true, redirect: "/" });

    } catch (error) {
        console.error("Native Google Auth Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
