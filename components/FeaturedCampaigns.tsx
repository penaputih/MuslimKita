"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { SerializableCampaign } from "@/lib/definitions";

export function FeaturedCampaigns({ campaigns }: { campaigns: SerializableCampaign[] }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    return (
        <section className="space-y-4 mb-8">
            <div className="px-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Program Kebaikan</h2>
                <Button variant="link" className="text-primary text-xs h-auto p-0">Lihat Semua</Button>
            </div>

            <ScrollArea className="w-full whitespace-nowrap px-6">
                <div className="flex w-max space-x-4 pb-4">
                    {campaigns.length === 0 && (
                        <div className="w-full text-center text-muted-foreground text-sm p-4">
                            Belum ada program aktif.
                        </div>
                    )}
                    {campaigns.map((campaign) => {
                        const rawProgress = (Number(campaign.currentAmount) / Number(campaign.targetAmount)) * 100;
                        const progress = Number(campaign.currentAmount) > 0 ? Math.max(1, Math.min(rawProgress, 100)) : 0;
                        return (
                            <Link href={`/campaign/${campaign.id}`} key={campaign.id} className="block transition-transform hover:scale-[1.02] active:scale-95">
                                <Card className="w-[280px] border-none dark:border dark:border-slate-800 dark:bg-slate-900 shadow-md overflow-hidden rounded-2xl flex-none cursor-pointer">
                                    <div className={`h-32 w-full relative bg-cover bg-center ${(!campaign.bannerImage?.startsWith('http') && !campaign.bannerImage?.startsWith('/') && !campaign.bannerImage?.startsWith('data:')) ? campaign.bannerImage : ''}`} style={{ backgroundImage: (campaign.bannerImage?.startsWith('http') || campaign.bannerImage?.startsWith('/') || campaign.bannerImage?.startsWith('data:')) ? `url(${campaign.bannerImage})` : undefined }}>
                                        {(!campaign.bannerImage?.startsWith('http') && !campaign.bannerImage?.startsWith('/') && !campaign.bannerImage?.startsWith('data:')) && <div className={`w-full h-full ${campaign.bannerImage}`}></div>}
                                        <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm border border-white/20">
                                            {campaign.category}
                                        </span>
                                    </div>
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">{campaign.title}</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] items-end font-medium">
                                                <span className="text-primary">{formatCurrency(Number(campaign.currentAmount))}</span>
                                                <span className="text-muted-foreground">{formatCurrency(Number(campaign.targetAmount))}</span>
                                            </div>
                                            <Progress value={progress} className="h-1.5 bg-muted" />
                                        </div>
                                        <Button className="w-full h-9 text-xs rounded-lg font-semibold pointer-events-none" size="sm">
                                            Donasi Sekarang
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
        </section>
    );
}
