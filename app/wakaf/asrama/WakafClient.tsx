"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentDrawer } from "@/components/PaymentDrawer";
import { ShareButton } from "@/components/ShareButton";

interface WakafClientProps {
    qrisImage?: string;
    bankAccount?: string;
    targetAmount?: number;
    initialRaised?: number;
    description?: string | null;
    image?: string | null;
    title?: string | null;
    category?: string | null;
    totalDonors?: number;
    programId?: string;
}

export default function WakafClient({
    qrisImage,
    bankAccount,
    targetAmount = 2000000000,
    initialRaised = 1250000000,
    description,
    image,
    title,
    category,
    totalDonors = 0,
    programId
}: WakafClientProps) {

    const [raisedAmount, setRaisedAmount] = useState(initialRaised);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [donorCount, setDonorCount] = useState(totalDonors);

    // Calculate progress percentage
    const rawProgress = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;
    const visualProgress = raisedAmount > 0 ? Math.max(1, Math.min(rawProgress, 100)) : 0;
    const formattedProgress = rawProgress > 0 && rawProgress < 1
        ? rawProgress.toLocaleString("id-ID", { maximumFractionDigits: 2 })
        : Math.round(rawProgress).toString();

    const handlePaymentSuccess = (amount: number) => {
        setRaisedAmount((prev) => prev + amount);
        setDonorCount((prev) => prev + 1);
    };

    const defaultDescription = `Mari bersama wujudkan pembangunan Asrama Santri Tahfidz Quran yang layak dan nyaman bagi para penghafal Al-Quran. Asrama ini akan menjadi tempat tinggal bagi 100 santri yatim dan dhuafa yang sedang berjuang menghafal 30 juz Al-Quran.
    
Setiap batu bata yang Anda wakafkan akan menjadi saksi amal jariyah yang pahalanya terus mengalir selamanya, menemani setiap lantunan ayat suci yang dibacakan para santri.

Kenapa harus berwakaf disini?
- Lahan sudah tersedia dan bersertifikat wakaf.
- Dikelola oleh tim profesional dan amanah.
- Laporan perkembangan pembangunan berkala.
- Mencetak generasi Qur'ani masa depan.`;

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pb-28">
            {/* Custom Header - Transparent/Overlay */}
            <div className="fixed top-0 w-full max-w-[540px] left-0 right-0 mx-auto z-40 p-4 flex items-center justify-between text-white">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-white backdrop-blur-sm">
                        <ArrowLeft className="size-6" />
                    </Button>
                </Link>
                <ShareButton
                    title={title || "Wakaf Asrama"}
                    text={description || "Mari berwakaf untuk pembangunan asrama santri."}
                />
            </div>

            <article>
                {/* Visual Header / Hero */}
                <div className="w-full relative aspect-video">
                    {/* Background Image */}
                    {image ? (
                        <img
                            src={image}
                            alt={title || "Wakaf Program"}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-muted-foreground">
                            <span className="text-sm">No Image Available</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Hero Content */}
                    <div className="relative z-10 px-6 pb-24 pt-32 space-y-4">
                        <Badge
                            variant="secondary"
                            className="rounded-md bg-teal-600/90 text-white hover:bg-teal-600 border-0 uppercase tracking-wide text-xs px-3 py-1.5 backdrop-blur-sm"
                        >
                            {category || "Wakaf Produktif"}
                        </Badge>

                        <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm max-w-sm">
                            {title || "Pembangunan Asrama Santri Tahfidz Quran"}
                        </h1>
                    </div>
                </div>

                {/* Overlapping Content Section */}
                <div className="relative px-4 -mt-16 z-20">
                    {/* Floating Progress Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-6">
                            {/* Stats Row */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Terkumpul</p>
                                    <p className="text-2xl font-bold text-teal-600 leading-none tracking-tight" suppressHydrationWarning>
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(raisedAmount)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Target</p>
                                    <p className="text-sm font-semibold text-slate-500 leading-none" suppressHydrationWarning>
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(targetAmount)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar & Footer */}
                            <div className="space-y-3">
                                <Progress value={visualProgress} className="h-3 bg-teal-50 dark:bg-teal-950/30 [&>div]:bg-teal-400" />
                                <div className="flex justify-between text-sm">
                                    <span suppressHydrationWarning className="text-slate-500">
                                        {formattedProgress}% tercapai
                                    </span>
                                    <span className="text-slate-500 font-medium">{donorCount} Donatur</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Text */}
                    <div className="mt-8 px-2 prose prose-sm prose-neutral dark:prose-invert max-w-none">
                        {(description && (description.trim().startsWith("<") || description.includes("</"))) ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: description }}
                                className="[&>p]:mb-4 last:[&>p]:mb-0 text-slate-600 leading-relaxed"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {description || defaultDescription}
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* Bottom Floating CTA */}
            <div className="fixed bottom-0 w-full max-w-[540px] left-0 right-0 mx-auto p-4 bg-white dark:bg-slate-950 border-t border-border z-50 flex items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="hidden sm:block flex-1">
                    <p className="text-xs text-muted-foreground">Minimal Wakaf</p>
                    <p className="font-bold text-primary">Rp 50.000</p>
                </div>
                <Button
                    className="w-full sm:w-auto sm:flex-1 font-bold h-12 text-base rounded-full shadow-lg shadow-teal-600/20 bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => setIsPaymentOpen(true)}
                >
                    <Wallet className="mr-2 size-5" />
                    Wakaf Sekarang
                </Button>
            </div>

            <PaymentDrawer
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                title="Wakaf Asrama"
                suggestedAmounts={[50000, 100000, 250000, 500000, 1000000, 2500000]}
                onSuccess={handlePaymentSuccess}
                programId={programId}
                programType="menuItem"
            />
        </main>
    );
}
