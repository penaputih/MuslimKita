"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Heart, ShieldCheck, Sun, Sunrise, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentDrawer } from "@/components/PaymentDrawer";
import { ShareButton } from "@/components/ShareButton";

interface ProgramProps {
    program: any; // Typed as any for flexibility with Prisma object
    qrisImage?: string;
    bankAccount?: string;
    totalDonors?: number;
}

export default function SedekahProgram({ program, qrisImage, bankAccount, totalDonors = 0 }: ProgramProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
            {/* Header & Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 text-white rounded-b-[2rem] shadow-xl">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative px-4 pt-6 pb-12">
                    {/* Navbar */}
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </Link>
                        <h1 className="text-lg font-bold tracking-wide">{program.categoryLabel || "Muslimkita"}</h1>
                        <ShareButton
                            title={program.pageTitle}
                            text={program.pageDescription || "Mari bersedekah hari ini."}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors text-white"
                        />
                    </div>

                    {/* Hero Content */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-2 ring-1 ring-white/40">
                            <Sunrise className="w-8 h-8 text-yellow-100" />
                        </div>
                        <h2 className="text-3xl font-bold leading-tight drop-shadow-sm">
                            {program.pageTitle}
                        </h2>
                        <p className="text-orange-50 text-sm max-w-xs mx-auto leading-relaxed opacity-90">
                            {program.pageDescription || "Raih keberkahan pagi hari dengan sedekah terbaik Anda."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Illustration / Image */}
            <div className="px-6 -mt-8 mb-6 relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    <img
                        src={program.pageImage || "/placeholder-sedekah.jpg"}
                        alt={program.pageTitle}
                        className="w-full aspect-video object-cover"
                    />
                </div>
            </div>

            {/* Daily Quote / Hadith */}
            <div className="px-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-4 -mt-4"></div>
                    <div className="flex gap-4">
                        <div className="shrink-0 mt-1">
                            <Info className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-neutral-600 text-sm italic leading-relaxed">
                                "Tidak ada satu subuh pun yang dialami hamba-hamba Allah kecuali turun kepada mereka dua malaikat. Salah satu di antaranya berdoa, 'Ya Allah, berilah ganti bagi orang yang berinfak'..."
                            </p>
                            <p className="text-xs font-semibold text-orange-600 text-right">— HR. Bukhari & Muslim</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Stats (Optional simulated) */}
            <div className="px-4 mb-24">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 text-center space-y-1">
                        <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-800">
                            {totalDonors}
                        </div>
                        <div className="text-xs text-neutral-500">Orang Bersedekah</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 text-center space-y-1">
                        <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-neutral-800">Everyday</div>
                        <div className="text-xs text-neutral-500">Istiqomah</div>
                    </div>
                </div>
            </div>


            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-orange-100 p-4 shadow-lg z-50 md:max-w-md md:mx-auto">
                <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-200 text-lg transition-all active:scale-[0.98]"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Sedekah Sekarang
                </Button>

                <PaymentDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title={program.pageTitle}
                    qrisImage={qrisImage}
                    bankAccount={bankAccount}
                    programId={program.id}
                />
            </div>
        </main>
    );
}
