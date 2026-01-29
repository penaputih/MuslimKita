"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { getPrayerTimes, getHijriDate, JadwalSholat } from "@/lib/jadwalSholat";
import { toast } from "@/hooks/use-toast";

interface PrayerWidgetProps {
    // Optional initial props if we want SSR support later, but mostly client now
    initialCity?: string;
}

export function PrayerWidget({ initialCity = "Bandung" }: PrayerWidgetProps) {
    const [timings, setTimings] = useState<JadwalSholat | null>(null);
    const [hijri, setHijri] = useState<string>("");
    const [gregorianDate, setGregorianDate] = useState<string>("");
    const [cityName, setCityName] = useState(initialCity);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); // Default to Bandung if null?

    // Bandung Coordinates Default
    const DEFAULT_COORDS = { lat: -6.9175, lng: 107.6191 };

    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Helper to parse time string "HH:mm" to minutes for comparison
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    // Calculate times based on coordinates
    const calculateTimes = (lat: number, lng: number) => {
        const now = new Date();
        const t = getPrayerTimes(lat, lng, now);
        setTimings(t);

        // Dates
        setHijri(getHijriDate(now));
        setGregorianDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };

    const updateLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Error", description: "Geolocation tidak didukung browser ini.", variant: "destructive" });
            return;
        }

        setUpdateStatus('loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setCityName("Lokasi Anda"); // Or reverse geocode if needed, but text "Lokasi Anda" is fine
                calculateTimes(latitude, longitude);
                setUpdateStatus('success');
                toast({ title: "Lokasi Diperbarui", description: "Jadwal sholat disesuaikan dengan titik GPS Anda." });

                setTimeout(() => setUpdateStatus('idle'), 3000);
            },
            (error) => {
                console.error("Geo Error:", error);
                setUpdateStatus('error');
                let msg = "Gagal mendeteksi lokasi.";
                if (error.code === 1) msg = "Izin lokasi ditolak.";
                toast({ title: "Gagal", description: msg, variant: "destructive" });

                // Fallback to default if manual trigger failed and no previous coords
                if (!coords) {
                    setCoords(DEFAULT_COORDS);
                    calculateTimes(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
                    setCityName("Bandung (Default)");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Initial Load - Try Geolocation instantly, or fallback to Bandung
    useEffect(() => {
        // Try getting location silently first
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setCityName("Lokasi Anda");
                calculateTimes(latitude, longitude);
            },
            () => {
                // Fallback silently
                setCoords(DEFAULT_COORDS);
                calculateTimes(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
                setCityName("Bandung (Default)");
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Countdown Logic
    useEffect(() => {
        if (!timings) return;

        const calculateNextPrayer = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const currentSeconds = now.getSeconds();

            const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            const displayNames: Record<string, string> = {
                Fajr: "Subuh",
                Dhuhr: "Dzuhur",
                Asr: "Ashar",
                Maghrib: "Maghrib",
                Isha: "Isya"
            };

            let upcoming = null;

            for (const name of prayerNames) {
                const pTime = timings[name];
                const pMinutes = timeToMinutes(pTime);

                if (pMinutes > currentMinutes) {
                    upcoming = {
                        name: displayNames[name],
                        time: pTime,
                        diff: pMinutes - currentMinutes
                    };
                    break;
                }
            }

            // If no upcoming prayer today, it's Fajr tomorrow
            if (!upcoming && timings.Fajr) {
                const fajrMinutes = timeToMinutes(timings.Fajr);
                const minutesUntilMidnight = (24 * 60) - currentMinutes;

                upcoming = {
                    name: displayNames["Fajr"],
                    time: timings.Fajr, // Note: This technically displays tomorrow's Fajr time (assuming same as today roughly)
                    diff: minutesUntilMidnight + fajrMinutes
                };
            }

            if (upcoming) {
                setNextPrayer(upcoming);

                // Precise calculation including seconds
                // upcoming.diff is in minutes relative to HH:mm (0 seconds)
                // So we need to subtract current seconds

                let totalSecondsLeft = (upcoming.diff * 60) - currentSeconds;

                if (totalSecondsLeft < 0) totalSecondsLeft = 0; // Should stick to 0 usually

                const h = Math.floor(totalSecondsLeft / 3600);
                const m = Math.floor((totalSecondsLeft % 3600) / 60);
                const s = totalSecondsLeft % 60;

                setTimeLeft(`-${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };

        calculateNextPrayer();
        const interval = setInterval(calculateNextPrayer, 1000);
        return () => clearInterval(interval);
    }, [timings]);

    if (!timings || !nextPrayer) return null; // Or skeleton

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg font-sans">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>



            <div className="relative p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div
                            className="flex items-center text-emerald-100 text-xs font-medium mb-1 cursor-pointer hover:text-white transition-colors group"
                            onClick={updateLocation}
                            title="Klik untuk perbarui lokasi (GPS)"
                        >
                            <MapPin className="w-3 h-3 mr-1" />
                            {cityName}, ID
                            {updateStatus === 'loading' && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                            {updateStatus === 'success' && <CheckCircle2 className="w-3 h-3 ml-2 text-emerald-300" />}
                            {updateStatus === 'error' && <XCircle className="w-3 h-3 ml-2 text-red-300" />}
                            {updateStatus === 'idle' && <RefreshCw className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <h3 className="font-bold text-white text-lg">
                            {gregorianDate}
                        </h3>
                        <p className="text-xs text-emerald-200 mt-0.5 font-amiri opacity-90">{hijri}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-emerald-200/70 font-medium tracking-wide">Waktu Kemenag RI</p>
                        <p className="text-emerald-100 text-xs font-medium">Menuju {nextPrayer.name}</p>
                        <p className="text-2xl font-bold tabular-nums tracking-tight font-mono">{timeLeft}</p>
                    </div>
                </div>

                {/* Prayer Grid */}
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => {
                        const displayNames: Record<string, string> = {
                            Fajr: "Subuh",
                            Dhuhr: "Dzuhur",
                            Asr: "Ashar",
                            Maghrib: "Maghrib",
                            Isha: "Isya"
                        };
                        const isActive = displayNames[p] === nextPrayer?.name;

                        return (
                            <div
                                key={p}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-white/25 ring-1 ring-white/50 shadow-sm scale-105"
                                    : "bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <span className={`text-[10px] uppercase tracking-wider mb-1 ${isActive ? "text-yellow-200 font-bold" : "text-emerald-100/70"}`}>
                                    {displayNames[p]}
                                </span>
                                <span className={`text-sm ${isActive ? "font-bold text-white" : "font-medium text-emerald-50"}`}>
                                    {timings[p]}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
