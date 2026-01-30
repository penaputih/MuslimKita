"use client";
// Force rebuild

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import useSWR from "swr";

export interface DonationProgressProps {
    programId: string;
    targetAmount: number;
    initialCollected: number;
    className?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDonationStats(programId: string, refreshInterval = 10000) {
    const { data, error } = useSWR(
        programId ? `/api/programs/${programId}/stats` : null,
        fetcher,
        { refreshInterval }
    );
    return { data, error };
}

export function DonationProgress({
    programId,
    targetAmount,
    initialCollected,
    className
}: DonationProgressProps) {
    // Optimistic UI: Start with initialCollected
    const [collected, setCollected] = useState(initialCollected);

    // Fetch live stats
    const { data } = useDonationStats(programId);

    useEffect(() => {
        if (data && typeof data.collected === "number") {
            setCollected(data.collected);
            if (data.mode) {
                // Trigger re-render if mode changed (SWR handles data deeply, but ensure mode usage is reactive)
            }
        }
    }, [data]);

    // Sync with server props when router.refresh() happens
    useEffect(() => {
        setCollected(initialCollected);
    }, [initialCollected]);

    // Calculate percentages
    const rawProgress = targetAmount > 0 ? (collected / targetAmount) * 100 : 0;
    const visualProgress = collected > 0 ? Math.max(1, Math.min(rawProgress, 100)) : 0;
    const formattedProgress = rawProgress > 0 && rawProgress < 1
        ? rawProgress.toLocaleString("id-ID", { maximumFractionDigits: 2 })
        : Math.round(rawProgress).toString();

    // Format currency
    const formattedCollected = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(collected);

    const formattedTarget = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(targetAmount);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Stats Row */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Terkumpul</p>
                    <p className="text-2xl font-bold text-teal-600 leading-none tracking-tight" suppressHydrationWarning>
                        {formattedCollected}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">Target</p>
                    <p className="text-sm font-semibold text-slate-500 leading-none" suppressHydrationWarning>
                        {formattedTarget}
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
                    {data?.mode && (
                        <span className="text-[10px] text-slate-400 font-medium">
                            {data.mode === "ONLINE" ? "Online" :
                                data.mode === "OFFLINE" ? "Manual" :
                                    data.mode === "HYBRID" ? "Online & Manual" : data.mode}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
