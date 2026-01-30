"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Sunrise, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentDrawer } from "@/components/PaymentDrawer";
import { useDonationStats } from "@/components/DonationProgress";
import { useEffect } from "react";

interface SedekahClientProps {
    qrisImage?: string;
    bankAccount?: string;
    totalDonations?: number;
    programId?: string;
    isOfflinePaymentActive?: boolean;
    isOnlinePaymentActive?: boolean;
}

export default function SedekahClient({
    qrisImage,
    bankAccount,
    totalDonations = 0,
    programId,
    isOfflinePaymentActive = false,
    isOnlinePaymentActive = true
}: SedekahClientProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Default to mix but since undone, just totalDonations
    const [raisedAmount, setRaisedAmount] = useState(totalDonations);

    const { data } = useDonationStats(programId || "");

    useEffect(() => {
        if (data && typeof data.collected === "number") {
            setRaisedAmount(data.collected);
        }
    }, [data]);

    const handlePaymentSuccess = (amount: number) => {
        setRaisedAmount((prev) => prev + amount);
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md fixed w-full max-w-[540px] left-0 right-0 mx-auto top-0 z-40 border-b border-border/40 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <h1 className="font-semibold text-lg bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                        Sedekah Subuh
                    </h1>
                </div>
                <Button size="icon" variant="ghost">
                    <Share2 className="size-5" />
                </Button>
            </div>

            {/* Hero Section with Sunrise Theme */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-800 to-orange-500 py-16 px-6 text-center text-white mt-16">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <Sunrise className="size-16 mb-4 text-orange-200 animate-pulse-slow" />
                    <h2 className="text-3xl font-bold mb-2">Awali Harimu dengan Kebaikan</h2>

                    {/* Total Stats */}
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 flex items-center gap-2 mx-auto">
                            <span className="text-orange-100 text-xs font-medium">Terkumpul</span>
                            <span className="font-bold text-white text-sm">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(raisedAmount)}
                            </span>
                        </div>
                    </div>

                    <p className="text-orange-100 text-sm max-w-xs mx-auto">
                        "Tidak ada satu subuh pun yang dialami hamba-hamba Allah kecuali turun kepada mereka dua malaikat..."
                    </p>
                </div>
                {/* Decorative Sun */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/30 rounded-full blur-3xl"></div>
            </div>

            {/* Content Card */}
            <div className="px-6 -mt-8 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-border/50">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                            <Heart className="size-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Keutamaan Sedekah Subuh</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Malaikat berdoa: "Ya Allah, berikanlah ganti bagi orang yang bersedekah." (HR. Bukhari & Muslim)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm border border-slate-100 dark:border-slate-700">
                            <p className="italic text-slate-600 dark:text-slate-300">
                                "Sedekah subuh bukan karena kita kaya, tapi karena kita ingin doa malaikat di pagi hari."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Sedekah Subuh */}
            <div className="px-6 py-8 space-y-6">
                <h3 className="font-semibold text-lg">Kenapa Rutin Sedekah Subuh?</h3>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { title: "Didoakan Malaikat", desc: "Mendapat doa khusus dari malaikat setiap pagi." },
                        { title: "Menolak Bala", desc: "Sedekah dapat menolak bencana dan musibah." },
                        { title: "Hapus Dosa", desc: "Sebagaimana air memadamkan api." },
                        { title: "Harta Berkah", desc: "Tidak akan berkurang harta karena sedekah." },
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-border/50 shadow-sm">
                            <div className="size-2 rounded-full bg-orange-500 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Floating CTA */}
            <div className="fixed bottom-0 w-full max-w-[540px] left-0 right-0 mx-auto p-4 bg-white dark:bg-slate-950 border-t border-border z-50">
                <Button
                    className="w-full font-bold h-12 text-base rounded-full shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white border-0"
                    onClick={() => setIsPaymentOpen(true)}
                >
                    <Sunrise className="mr-2 size-5" />
                    Sedekah Subuh Sekarang
                </Button>
            </div>

            <PaymentDrawer
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                title="Sedekah Subuh"
                programId={programId}
                suggestedAmounts={[10000, 20000, 50000, 100000]} // Smaller amounts for daily routine
                onSuccess={handlePaymentSuccess}
                programType="menuItem"
                isOfflinePaymentActive={isOfflinePaymentActive}
                isOnlinePaymentActive={isOnlinePaymentActive}
            />
        </main>
    );
}
