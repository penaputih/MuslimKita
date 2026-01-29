import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "API Key belum dipasang di .env" }, { status: 500 });
    }

    try {
        // Kita tanya langsung ke Server Google: "Saya punya kunci ini, boleh pakai model apa aja?"
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Gagal koneksi ke Google" }, { status: 500 });
    }
}
