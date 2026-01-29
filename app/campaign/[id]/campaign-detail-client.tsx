"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Share2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentDrawer } from "@/components/PaymentDrawer";
import { SerializableCampaign } from "@/lib/definitions";
import { ShareButton } from "@/components/ShareButton";

// We need a specific interface here since SerializableCampaign might store decimals as numbers/strings differently
// But let's assume we receive the Prisma object directly from the server component
// which we might need to serialize if passing complex objects, but for now we'll accept 'any' or define a rough shape.
// Actually, let's use the shape passed from the page.

interface CampaignDetailClientProps {
    campaign: any;
    qrisImage?: string;
    bankAccount?: string;
    totalDonors?: number;
}

export default function CampaignDetailClient({
    campaign,
    qrisImage,
    bankAccount,
    totalDonors = 0,
}: CampaignDetailClientProps) {

    const targetAmount = Number(campaign.targetAmount);
    const initialRaised = Number(campaign.currentAmount);

    const [raisedAmount, setRaisedAmount] = useState(initialRaised);
    const [donorCount, setDonorCount] = useState(totalDonors);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Calculate progress percentage
    const rawProgress = targetAmount > 0 ? (raisedAmount / targetAmount) * 100 : 0;

    // Visual: Ensure at least 1% is filled if there is any donation so it's visible
    const visualProgress = raisedAmount > 0 ? Math.max(1, Math.min(rawProgress, 100)) : 0;

    // Text: Show decimals for small values (< 1%), otherwise round to integer
    const formattedProgress = rawProgress > 0 && rawProgress < 1
        ? rawProgress.toLocaleString("id-ID", { maximumFractionDigits: 2 })
        : Math.round(rawProgress).toString(); // e.g. "50"

    const handlePaymentSuccess = (amount: number) => {
        setRaisedAmount((prev) => prev + amount);
        setDonorCount((prev) => prev + 1);
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            {/* Header */}
            <div className="bg-white dark:bg-slate-950 fixed w-full max-w-[540px] left-0 right-0 mx-auto top-0 z-40 border-b border-border/40 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <h1 className="font-semibold text-lg line-clamp-1">{campaign.title}</h1>
                </div>
                <ShareButton
                    title={campaign.title}
                    text={campaign.description || "Mari berdonasi."}
                />
            </div>

            {/* Hero Image */}
            <div className="w-full aspect-video bg-muted relative overflow-hidden mt-16">
                {campaign.bannerImage ? (
                    <div
                        className="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-700"
                        style={{ backgroundImage: `url(${campaign.bannerImage})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold leading-tight">
                                {campaign.title}
                            </h2>
                        </div>
                    </div>
                )}
                {campaign.bannerImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                        <div className="text-white">
                            <span className="bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                                {campaign.category?.name || "Program Kebaikan"}
                            </span>
                            <h2 className="text-2xl font-bold leading-tight line-clamp-2">
                                {campaign.title}
                            </h2>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-6 -mt-6 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-border">
                    {/* Progress Stats */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Terkumpul</p>
                                <p className="text-lg font-bold text-primary leading-none" suppressHydrationWarning>
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(raisedAmount)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Target</p>
                                <p className="text-xs font-medium text-muted-foreground leading-none" suppressHydrationWarning>
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(targetAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Progress value={visualProgress} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formattedProgress}% tercapai</span>
                                <span>{donorCount} Donatur</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6 overflow-hidden">
                <p className="whitespace-pre-line text-left leading-relaxed text-gray-600 text-sm">
                    {campaign.description || ""}
                </p>
            </div>

            {/* Bottom Floating CTA */}
            <div className="fixed bottom-0 w-full max-w-[540px] left-0 right-0 mx-auto p-4 bg-white dark:bg-slate-950 border-t border-border z-50 flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Minimal Donasi</p>
                    <p className="font-bold text-primary">Rp 10.000</p>
                </div>
                <Button
                    className="flex-1 font-bold h-12 text-base rounded-full shadow-lg shadow-primary/20"
                    onClick={() => setIsPaymentOpen(true)}
                >
                    <Wallet className="mr-2 size-5" />
                    Donasi Sekarang
                </Button>
            </div>

            <PaymentDrawer
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                title={campaign.title}
                programId={campaign.id}
                suggestedAmounts={[10000, 25000, 50000, 100000, 250000, 500000]}
                onSuccess={handlePaymentSuccess}
            />
        </main>
    );
}
