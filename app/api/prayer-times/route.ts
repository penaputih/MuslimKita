import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Ambil koordinat dari query param (dikirim dari HP user)
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json({ error: "Butuh Lat & Lng" }, { status: 400 });
    }

    // Panggil API Aladhan dengan Metode Kemenag (method=20)
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const apiUrl = `http://api.aladhan.com/v1/timings/${date}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=20`;

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        return NextResponse.json({
            lokasi: "Sesuai Titik GPS",
            sumber: "Kemenag RI (via Aladhan)",
            jadwal: data.data.timings, // Isinya: Fajr, Dhuhr, Asr, Maghrib, Isha
            date: data.data.date.hijri // Bonus: Pass Hijri date if needed by widget
        });
    } catch (error) {
        return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
    }
}
