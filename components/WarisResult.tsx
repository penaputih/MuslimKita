"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Info, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { CalculationResult } from "@/lib/warisLogic";
import { formatCurrency } from "@/lib/utils";
import { IndividualHeir, HEIR_LABELS } from "@/lib/waris";

interface WarisResultProps {
    result: CalculationResult;
    heirs: IndividualHeir[];
    deceasedGender: "L" | "P";
    assetsRaw: { assets: string; tajhiz: string; debt: string; wasiat: string };
}

export function WarisResult({ result, heirs, deceasedGender, assetsRaw }: WarisResultProps) {
    // Helper for initials (Print Only - kept for reference if needed, though mostly moved to PDF now)
    // We can keep it if the UI uses it, but the UI below doesn't seemingly use initials except in the table maybe?
    // Reviewing UI: It uses role and name.

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Normal": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "Aul": return "bg-amber-100 text-amber-800 border-amber-200";
            case "Radd": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Normal": return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
            case "Aul": return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case "Radd": return <Info className="w-5 h-5 text-blue-600" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border ${getStatusColor(result.status)} flex items-start gap-4`}>
                <div className="mt-1">{getStatusIcon(result.status)}</div>
                <div>
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        Status Perhitungan: {result.status}
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                        {result.status === "Normal" && "Alhamdulillah, total bagian pas (1)."}
                        {result.status === "Aul" && "Terjadi defisit (kekurangan) harta. Bagian dikurangi proporsional ('Aul)."}
                        {result.status === "Radd" && "Terdapat sisa harta (surplus). Sisa dikembalikan (Radd)."}
                    </p>
                </div>
            </div>

            {/* Smart Explanation Accordion */}
            <Accordion type="single" collapsible defaultValue="steps" className="bg-white rounded-xl border shadow-sm">
                <AccordionItem value="steps" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 rounded-t-xl transition-colors">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Info className="w-4 h-4" />
                            Penjelasan Langkah Perhitungan
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                        <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                            {result.explanationSteps.map((step, idx) => (
                                <li key={idx} className="pl-6 relative group">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white group-hover:bg-primary transition-colors" />
                                    <p className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                        {step.split("**").map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="font-bold text-primary">{part}</strong> : part
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Detailed Table */}
            <Card className="shadow-md border-primary/20 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base text-slate-800 flex justify-between items-center">
                        <span>Hasil Pembagian Waris</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="font-bold text-slate-700 whitespace-nowrap px-6">Ahli Waris</TableHead>
                                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">Bagian Awal</TableHead>
                                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                                        {result.status === "Normal" ? "Bagian Akhir" : "Porsi Akhir"}
                                    </TableHead>
                                    <TableHead className="text-right font-bold text-slate-700 whitespace-nowrap px-6">Nominal (Rp)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.finalHeirs.map((heir) => (
                                    <TableRow key={heir.id} className={`${heir.finalAmount === 0 ? "bg-slate-50/50" : ""}`}>
                                        <TableCell className="font-medium align-top px-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-900 font-semibold">{heir.role}</span>

                                                {/* STATUS LABEL */}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border w-fit font-medium 
                                                    ${heir.faraidStatus?.includes("Ashabah") ? "text-slate-500 italic border-slate-200 bg-slate-50" :
                                                        heir.faraidStatus === "Mahjub (Terhalang)" ? "text-red-600 border-red-100 bg-red-50" :
                                                            "text-emerald-700 border-emerald-100 bg-emerald-50"}`}>
                                                    {heir.faraidStatus}
                                                </span>

                                                {heir.note && (
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal mt-0.5">
                                                        <span>ℹ️</span>
                                                        <span>{heir.note}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap align-top pt-3">
                                            {heir.baseShareText !== "Asabah" && heir.baseShareText !== "Mahjub" && heir.baseShareText !== "Dzawil Arham" ? (
                                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-amber-400 text-white font-bold text-xs shadow-sm">
                                                    {heir.baseShareText}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-600 font-medium">
                                                    {heir.baseShareText === "Asabah" ? "Asabah" : "-"}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap align-top pt-3">
                                            <span className="text-blue-600 font-medium text-sm">
                                                {heir.finalShareText}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold whitespace-nowrap align-top pt-3 px-6 ${heir.finalAmount > 0 ? "text-slate-900" : "text-slate-400"}`}>
                                            {formatCurrency(heir.finalAmount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-50/80 font-bold border-t border-slate-200">
                                    <TableCell colSpan={3} className="text-right text-slate-800 px-6">Total Terbagi</TableCell>
                                    <TableCell className="text-right text-emerald-600 text-base px-6">
                                        {formatCurrency(result.finalHeirs.reduce((acc, curr) => acc + curr.finalAmount, 0))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Neraca Perhitungan Card */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-2">
                    <CardTitle className="text-base font-semibold text-slate-700">Neraca Perhitungan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        <div className="flex justify-between items-center px-6 py-4">
                            <span className="text-sm font-medium text-slate-600">Total Harta Waris</span>
                            <span className="text-lg font-bold text-slate-900">{formatCurrency(result.totalHarta)}</span>
                        </div>
                        <div className="flex justify-between items-center px-6 py-4">
                            <span className="text-sm font-medium text-slate-600">Kebutuhan Ashabul Furud</span>
                            <span className="text-base font-semibold text-slate-700">{formatCurrency(result.neraca.totalJatahAwal)}</span>
                        </div>
                        <div className="px-6 py-4">
                            <div className={`p-3 rounded-lg border flex items-center justify-between ${result.neraca.statusNeraca === "SISA" ? "bg-emerald-50 border-emerald-100" :
                                result.neraca.statusNeraca === "KURANG" ? "bg-amber-50 border-amber-100" :
                                    "bg-slate-100 border-slate-200"
                                }`}>
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-0.5">Status Neraca</span>
                                    <span className={`font-bold text-sm ${result.neraca.statusNeraca === "SISA" ? "text-emerald-700" :
                                        result.neraca.statusNeraca === "KURANG" ? "text-amber-700" :
                                            "text-slate-700"
                                        }`}>
                                        {result.neraca.statusNeraca} - {
                                            result.neraca.statusNeraca === "SISA" ? "Sisa Harta" :
                                                result.neraca.statusNeraca === "KURANG" ? "Kekurangan" :
                                                    "Pas"}
                                    </span>
                                </div>
                                <div className={`font-bold text-base ${result.neraca.statusNeraca === "SISA" ? "text-emerald-700" :
                                    result.neraca.statusNeraca === "KURANG" ? "text-amber-700" :
                                        "text-slate-700"
                                    }`}>
                                    {result.neraca.statusNeraca === "SISA" ? formatCurrency(result.neraca.selisih) :
                                        result.neraca.statusNeraca === "KURANG" ? formatCurrency(Math.abs(result.neraca.selisih)) :
                                            "-"}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dalil / Alasan Syari Cards */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Penjelasan Syar'i (Dalil)
                </h3>
                <Card className="shadow-md border-l-4 border-l-primary/50">
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {result.finalHeirs.map((heir, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                            <h4 className="font-bold text-slate-800">{heir.role}</h4>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {heir.finalShareText}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed pl-8">
                                        {heir.reason || "Mendapat bagian sesuai perhitungan Faraid."}
                                    </p>
                                    {heir.note && (
                                        <div className="mt-2 ml-8">
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                                Info: {heir.note}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
