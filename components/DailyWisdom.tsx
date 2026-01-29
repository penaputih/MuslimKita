"use client";

import { useEffect, useState } from "react";
import { DailyDoa } from "@/lib/api"; // Keep type import or use from actions if exported
import { fetchDailyDoa } from "@/app/actions";
import { Quote, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DailyWisdom() {
    const [doa, setDoa] = useState<DailyDoa | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDoa = async () => {
        setLoading(true);
        const data = await fetchDailyDoa();
        setDoa(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDoa();
    }, []);

    const handleShare = () => {
        if (navigator.share && doa) {
            navigator.share({
                title: doa.doa,
                text: `${doa.doa}\n\n"${doa.artinya}"\n\n— DISA App`,
            }).catch(console.error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-slate-800 relative overflow-hidden">
            {/* Decorative Quote Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Quote className="w-24 h-24 text-emerald-600 rotate-180" />
            </div>

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Quote className="w-4 h-4 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-neutral-800 dark:text-slate-100">Doa Harian</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchDoa} disabled={loading} className="h-8 w-8 text-neutral-400">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-neutral-100 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto"></div>
                        <div className="h-16 bg-neutral-100 rounded mt-4"></div>
                    </div>
                ) : doa ? (
                    <div className="text-center space-y-4">
                        <h4 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">{doa.doa}</h4>

                        <p className="font-arab text-2xl text-neutral-800 dark:text-slate-100 leading-loose" dir="rtl">
                            {doa.ayat}
                        </p>

                        <div className="space-y-2">
                            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium italic">
                                {doa.latin}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
                                {doa.artinya}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs gap-2"
                                onClick={handleShare}
                            >
                                <Share2 className="w-3 h-3" />
                                Bagikan Kebaikan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-neutral-400 text-sm">
                        Gagal memuat doa hari ini.
                        <br />
                        <button onClick={fetchDoa} className="text-emerald-600 underline mt-2">Coba lagi</button>
                    </div>
                )}
            </div>
        </div>
    );
}
