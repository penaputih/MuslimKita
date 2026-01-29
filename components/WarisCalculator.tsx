"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calculator, AlertCircle, Plus, Trash2, UserPlus, Users, Printer } from "lucide-react";
import { calculateNetEstate, calculateSharesAdvanced, Gender, HeirType, HEIR_LABELS, IndividualHeir } from "@/lib/waris";
import { formatCurrency } from "@/lib/utils";



import { WarisResult } from "./WarisResult";
import { calculateFaraid, Heir } from "@/lib/warisLogic";
import { useToast } from "@/hooks/use-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { WarisPdfDocument } from "./pdf/WarisPdfDocument";
import { Download } from "lucide-react";

export function WarisCalculator() {
    const { toast } = useToast();

    // Inputs - Assets
    const [assets, setAssets] = useState<string>("");
    const [tajhiz, setTajhiz] = useState<string>("");
    const [debt, setDebt] = useState<string>("");
    const [wasiat, setWasiat] = useState<string>("");

    // Inputs - Heirs
    const [deceasedGender, setDeceasedGender] = useState<Gender>("L");
    const [heirs, setHeirs] = useState<IndividualHeir[]>([]);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHeirName, setNewHeirName] = useState("");
    const [newHeirType, setNewHeirType] = useState<HeirType | "">("");

    // Helpers
    const format = (val: string) => {
        if (!val) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(val.replace(/\D/g, "")));
    };

    const changeDeceasedGender = (newGender: Gender) => {
        if (newGender === deceasedGender) return;

        // Check for conflicts
        if (newGender === "P" && heirs.some(h => h.type === HeirType.WIFE)) {
            toast({
                variant: "destructive",
                title: "Perubahan Gagal",
                description: "Tidak mungkin perempuan memiliki istri. Hapus 'Istri' terlebih dahulu.",
            });
            return;
        }

        if (newGender === "L" && heirs.some(h => h.type === HeirType.HUSBAND)) {
            toast({
                variant: "destructive",
                title: "Perubahan Gagal",
                description: "Tidak mungkin laki-laki memiliki suami. Hapus 'Suami' terlebih dahulu.",
            });
            return;
        }

        setDeceasedGender(newGender);
    };

    const addHeir = () => {
        if (!newHeirName || !newHeirType) return;

        const newHeir: IndividualHeir = {
            id: Math.random().toString(36).substring(7),
            name: newHeirName,
            type: newHeirType
        };

        setHeirs([...heirs, newHeir]);
        setNewHeirName("");
        setNewHeirType("");
        setIsDialogOpen(false);
    };

    const removeHeir = (id: string) => {
        setHeirs(heirs.filter(h => h.id !== id));
    };

    // Calculate Smart Logic
    const smartResult = useMemo(() => {
        const numAssets = parseInt(assets.replace(/\D/g, "") || "0");
        const numTajhiz = parseInt(tajhiz.replace(/\D/g, "") || "0");
        const numDebt = parseInt(debt.replace(/\D/g, "") || "0");
        const numWasiat = parseInt(wasiat.replace(/\D/g, "") || "0");

        const { net, note: wasiatNote } = calculateNetEstate(numAssets, numTajhiz, numDebt, numWasiat);

        // Get Base Shares from old logic first (to determine who gets what fraction initially)
        // We reuse the existing 'calculateSharesAdvanced' to get the Furudh (Base Shares)
        // Then pass those to our new 'calculateFaraid' logic for Aul/Radd handling.

        const initialShares = calculateSharesAdvanced(heirs, net, deceasedGender);

        // Transform to new Heir structure
        const mappedHeirs: Heir[] = initialShares
            // STOP FILTERING MAHJOUB: We want to show them in the table with 0 amount
            // .filter(h => !h.status.toLowerCase().includes("mahjoub")) 
            .map(h => ({
                id: h.heirId,
                role: HEIR_LABELS[h.type], // e.g. "Istri"
                baseShare: h.percentage,
                baseShareText: h.share.includes("Asabah") ? "Asabah" : h.share,
                isSpouse: h.type === HeirType.HUSBAND || h.type === HeirType.WIFE
            }));

        if (mappedHeirs.length === 0) return null;

        return calculateFaraid(mappedHeirs, net);
    }, [assets, tajhiz, debt, wasiat, deceasedGender, heirs]);

    // Grouping for Heir Type Select
    const heirOptions = Object.entries(HEIR_LABELS).filter(([key]) => {
        // Gender constraints
        if (deceasedGender === "L" && key === HeirType.HUSBAND) return false;
        if (deceasedGender === "P" && key === HeirType.WIFE) return false;

        // Single instance constraints (Father & Mother)
        if (key === HeirType.FATHER && heirs.some(h => h.type === HeirType.FATHER)) return false;
        if (key === HeirType.MOTHER && heirs.some(h => h.type === HeirType.MOTHER)) return false;

        return true;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:space-y-4">
            <style type="text/css" media="print">
                {`
                    @page { 
                        size: auto;   /* auto is the initial value */
                        margin: 2.54cm; 
                    }
                `}
            </style>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold text-primary">Laporan Pembagian Waris Islam</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Dihitung menggunakan Aplikasi MuslimKita - Daarussyifa Apps pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </p>
            </div>

            {/* Top Actions - PDF Download */}
            <div className="flex justify-end print:hidden">
                {smartResult ? (
                    <PDFDownloadLink
                        document={
                            <WarisPdfDocument
                                data={{ assets, tajhiz, debt, wasiat }}
                                heirs={heirs}
                                result={smartResult}
                                deceasedGender={deceasedGender}
                            />
                        }
                        fileName={`Laporan_Waris_${new Date().toISOString().split('T')[0]}.pdf`}
                    >
                        {({ blob, url, loading, error }: { blob: Blob | null; url: string | null; loading: boolean; error: any }) => (
                            <Button variant="outline" className="gap-2 bg-white border-teal-200 text-teal-700 hover:bg-teal-50" disabled={loading}>
                                <Download className="w-4 h-4" />
                                {loading ? 'Menyiapkan PDF...' : 'Download Laporan PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                ) : (
                    <Button variant="outline" className="gap-2 bg-gray-50 text-gray-400 border-gray-200" disabled>
                        <Download className="w-4 h-4" />
                        Download Laporan PDF
                    </Button>
                )}
            </div>

            {/* 1. Harta Tirkah - Hidden on Print now because we use Template */}
            <div className="print:hidden space-y-6">
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="print:px-0 print:py-2">
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="size-5 text-primary" />
                            Harta Peninggalan (Tirkah)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 print:space-y-2 print:px-0">
                        {/* Interactive View */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Total Aset (Harta Kasar)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                    <Input
                                        value={format(assets)}
                                        onChange={(e) => setAssets(e.target.value)}
                                        placeholder="0"
                                        className="pl-10 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Biaya Tajhiz</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            value={format(tajhiz)}
                                            onChange={(e) => setTajhiz(e.target.value)}
                                            placeholder="0"
                                            className="pl-10 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hutang (Dayn)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            value={format(debt)}
                                            onChange={(e) => setDebt(e.target.value)}
                                            placeholder="0"
                                            className="pl-10 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Wasiat (Max 1/3)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                    <Input
                                        value={format(wasiat)}
                                        onChange={(e) => setWasiat(e.target.value)}
                                        placeholder="0"
                                        className="pl-10 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span>Harta Bersih (Net Estate)</span>
                                    <span className="text-primary text-lg">
                                        {smartResult ? formatCurrency(smartResult.totalHarta) : "Rp 0"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Ahli Waris Selector */}
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="print:px-0 print:py-2">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Ahli Waris
                            <span className="hidden print:inline-block ml-auto text-sm font-normal text-muted-foreground">
                                Mayit: {deceasedGender === "L" ? "Laki-laki" : "Perempuan"}
                            </span>
                        </CardTitle>
                        <CardDescription className="print:hidden">Tambahkan siapa saja keluarga yang ditinggalkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 print:space-y-2 print:px-0">
                        <div className="space-y-3 print:hidden">
                            <Label>Jenis Kelamin Mayit</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant={deceasedGender === "L" ? "default" : "outline"}
                                    onClick={() => changeDeceasedGender("L")}
                                    className="w-full"
                                >
                                    Laki-laki
                                </Button>
                                <Button
                                    variant={deceasedGender === "P" ? "default" : "outline"}
                                    onClick={() => changeDeceasedGender("P")}
                                    className="w-full"
                                >
                                    Perempuan
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center print:hidden">
                                <Label>Daftar Keluarga ({heirs.length})</Label>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <UserPlus className="size-4" />
                                            Tambah Waris
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Tambah Ahli Waris</DialogTitle>
                                            <DialogDescription>
                                                Masukkan nama dan hubungan kekerabatan dengan mayit.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nama Lengkap</Label>
                                                <Input id="name" value={newHeirName} onChange={(e) => setNewHeirName(e.target.value)} placeholder="Contoh: Budi" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="type">Hubungan (Kedudukan)</Label>
                                                <Select value={newHeirType} onValueChange={(v) => setNewHeirType(v as HeirType)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih hubungan..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px]">
                                                        {heirOptions.map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={addHeir} disabled={!newHeirName || !newHeirType}>Simpan</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {heirs.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm bg-slate-50 print:border-slate-200">
                                    Belum ada ahli waris.
                                </div>
                            ) : (
                                <div className="space-y-2 print:grid print:grid-cols-2 print:gap-2 print:space-y-0">
                                    {heirs.map((heir) => (
                                        <div key={heir.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm print:shadow-none print:border-slate-200 print:text-sm print:p-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs print:size-6 print:text-[10px]">
                                                    {heir.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{heir.name}</p>
                                                    <p className="text-xs text-muted-foreground">{HEIR_LABELS[heir.type]}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeHeir(heir.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 print:hidden">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {smartResult ? (
                    <WarisResult
                        result={smartResult}
                        heirs={heirs}
                        deceasedGender={deceasedGender}
                        assetsRaw={{ assets, tajhiz, debt, wasiat }}
                    />
                ) : (
                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Calculator className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>Hasil perhitungan akan muncul di sini</p>
                    </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm print:bg-transparent print:text-gray-600 print:border print:border-gray-200">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <p>
                        <strong>Disclaimer:</strong> Perhitungan ini menggunakan kaidah Fiqh Mawaris Mazhab Syafi&apos;i standar (termasuk logika 'Aul dan Radd).
                        Mohon konsultasikan kembali dengan Asatidz atau ulama setempat untuk penetapan final dan eksekusi pembagian.
                    </p>
                </div>
            </div>


        </div>
    );
}
