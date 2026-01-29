import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const intent = searchParams.get("intent") || "login"; // "login" or "register"

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback";

    if (!clientId) {
        return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 });
    }

    const scope = "openid email profile";
    const responseType = "code";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent&state=${intent}`;

    return NextResponse.redirect(googleAuthUrl);
}
