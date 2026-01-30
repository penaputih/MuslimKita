"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Scale, HeartHandshake } from "lucide-react";

interface GonoGiniBreakdownProps {
    totalGonoGini: number;
}

export function GonoGiniBreakdown({ totalGonoGini }: GonoGiniBreakdownProps) {
    if (totalGonoGini <= 0) return null;

    const spouseShare = totalGonoGini * 0.5;
    const estateShare = totalGonoGini * 0.5;

    return (
        <Card className="shadow-md border-blue-200 overflow-hidden mb-6">
            <CardHeader className="bg-blue-50/50 pb-3 border-b border-blue-100">
                <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-blue-600" />
                    Pemisahan Harta Bersama (Gono-Gini)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Left: Hak Pasangan */}
                    <div className="flex-1 p-5 bg-emerald-50/30">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Hak Pasangan Hidup (50%)</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 mb-1">
                            {formatCurrency(spouseShare)}
                        </div>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <CheckIcon />
                            Bukan Waris (Milik Pribadi Pasangan)
                        </p>
                    </div>

                    {/* Right: Masuk Warisan */}
                    <div className="flex-1 p-5 bg-amber-50/30">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold text-amber-800 uppercase tracking-wider">Harta Waris / Tirkah (50%)</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-700 mb-1">
                            {formatCurrency(estateShare)}
                        </div>
                        <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <ArrowIcon />
                            Akan dibagi ke ahli waris
                        </p>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Harta Bersama</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(totalGonoGini)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function ArrowIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    )
}
