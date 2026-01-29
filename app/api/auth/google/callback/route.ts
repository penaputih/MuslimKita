import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    // Force rebuild
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // "login" or "register"
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=Google login failed`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Google configuration missing" }, { status: 500 });
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            console.error("Token exchanges failed", tokens);
            return NextResponse.redirect(`${appUrl}/login?error=Google login failed`);
        }

        // Get User Info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            return NextResponse.redirect(`${appUrl}/login?error=Email not found from Google`);
        }

        // Find or Create User
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            if (state === "register") {
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
                        // Workaround for stale server cache
                        password: crypto.randomUUID(),
                    } as any,
                });

                const { sendVerificationEmail } = await import("@/lib/mail");
                await sendVerificationEmail(googleUser.email, code);

                return NextResponse.redirect(`${appUrl}/verify?email=${encodeURIComponent(googleUser.email)}`);

            } else {
                return NextResponse.redirect(`${appUrl}/login?error=Akun belum terdaftar. Silahkan daftar terlebih dahulu.`);
            }
        }

        // Enforce verification for existing users logging in
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

            return NextResponse.redirect(`${appUrl}/verify?email=${encodeURIComponent(user.email)}`);
        }

        // Update user image if changed (optional, but good for sync)
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

        return NextResponse.redirect(`${appUrl}`);

    } catch (error) {
        console.error("Google Auth Error:", error);
        return NextResponse.redirect(`${appUrl}/login?error=Authentication error`);
    }
}
