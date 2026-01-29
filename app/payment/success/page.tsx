"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, HeartHandshake, Home } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export default function PaymentSuccessPage() {
    const [showConfetti, setShowConfetti] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const amountStr = searchParams.get("amount") || "0";
    const amount = parseInt(amountStr);

    useEffect(() => {
        // Trigger confetti on mount
        setShowConfetti(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <Confetti active={showConfetti} config={confettiConfig} />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-900/10 pointer-events-none" />

                <div className="relative z-10 w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 font-serif">
                        Alhamdulillah
                    </h1>
                    <p className="font-medium text-lg text-slate-800 dark:text-slate-100">
                        Pembayaran Berhasil!
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 w-full border border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Donasi</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)}
                    </p>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                    Jazakumullah Khairan Katsiran.<br />
                    Semoga Allah menerima amal ibadah Anda dan membalasnya dengan kebaikan yang berlipat ganda. Aamiin.
                </p>

                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 w-full">
                    <p className="italic text-emerald-800 dark:text-emerald-300 text-sm font-serif leading-relaxed">
                        "Sesungguhnya orang-orang yang bersedekah baik laki-laki maupun perempuan dan meminjamkan kepada Allah pinjaman yang baik, niscaya akan dilipat-gandakan (pembayarannya) kepada mereka; dan bagi mereka pahala yang banyak."
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2 font-semibold text-right">— QS. Al-Hadid: 18</p>
                </div>

                <div className="w-full space-y-3 pt-4">
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base font-semibold shadow-lg shadow-emerald-200 dark:shadow-none"
                        onClick={() => router.push("/")}
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        </div>
    );
}
