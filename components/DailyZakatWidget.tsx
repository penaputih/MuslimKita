"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Wallet, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { submitTransaction } from "@/app/actions";

export function DailyZakatWidget({ qrisImage }: { qrisImage?: string }) {
    const [inputValue, setInputValue] = React.useState("");
    const [zakatAmount, setZakatAmount] = React.useState(0);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digit characters
        const rawValue = e.target.value.replace(/\D/g, "");
        setInputValue(rawValue);

        // Calculate 2.5%
        const amount = parseInt(rawValue || "0", 10);
        setZakatAmount(Math.floor(amount * 0.025));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handlePayment = async () => {
        if (!selectedFile) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("amount", zakatAmount.toString());
        formData.append("proofImage", selectedFile.name);

        const result = await submitTransaction(formData);

        setIsSubmitting(false);
        if (result.success) {
            setIsSuccess(true);
        }
    };

    const resetForm = () => {
        setIsSuccess(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const formattedValue = React.useMemo(() => {
        if (!inputValue) return "";
        return new Intl.NumberFormat("id-ID", {
            style: "decimal",
            maximumFractionDigits: 0,
        }).format(parseInt(inputValue, 10));
    }, [inputValue]);

    const formattedZakat = React.useMemo(() => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(zakatAmount);
    }, [zakatAmount]);

    return (
        <section className="px-6 mb-8" id="calculator">
            <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-0 flex flex-col">
                    <div className="bg-primary/5 p-4 flex items-center gap-3 border-b border-primary/10">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Wallet className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">
                                Sudahkah Bersedekah?
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Sucikan harta dengan berzakat (2.5%)
                            </p>
                        </div>
                    </div>
                    <div className="p-4 flex gap-3 items-center">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                                Rp
                            </span>
                            <Input
                                inputMode="numeric"
                                placeholder="0"
                                value={formattedValue}
                                onChange={handleInputChange}
                                className="pl-9 h-10 bg-muted/30 border-none text-sm font-semibold rounded-lg"
                            />
                        </div>

                        <Drawer
                            open={isDrawerOpen}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setIsDrawerOpen(false);
                                    setTimeout(resetForm, 300);
                                } else {
                                    setIsDrawerOpen(true);
                                }
                            }}
                        >
                            <DrawerTrigger asChild>
                                <Button
                                    size="sm"
                                    disabled={zakatAmount <= 0}
                                    className="rounded-lg h-10 px-6 font-semibold bg-primary hover:bg-primary/90"
                                >
                                    Bayar
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="rounded-t-[2rem]">
                                <div className="mx-auto w-full max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle className="text-center text-xl">
                                            {isSuccess
                                                ? "Pembayaran Berhasil"
                                                : "Konfirmasi Zakat"}
                                        </DrawerTitle>
                                    </DrawerHeader>

                                    <div className="p-4 pb-0 space-y-6">
                                        {isSuccess ? (
                                            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="size-10 text-primary" />
                                                </div>
                                                <p className="text-center text-muted-foreground">
                                                    Terima kasih! Bukti pembayaran zakat Anda sebesar{" "}
                                                    <span className="font-bold text-foreground">
                                                        {formattedZakat}
                                                    </span>{" "}
                                                    telah kami terima.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col items-center space-y-3">
                                                    <div className="bg-primary/5 px-6 py-3 rounded-xl border border-primary/10">
                                                        <span className="text-sm text-muted-foreground block text-center mb-1">Total Zakat (2.5%)</span>
                                                        <span className="font-bold text-primary text-2xl">
                                                            {formattedZakat}
                                                        </span>
                                                    </div>

                                                    <span className="text-xs text-muted-foreground mt-2">
                                                        Scan QRIS dibawah ini untuk membayar
                                                    </span>
                                                    {/* Placeholder QRIS */}
                                                    <div className="w-48 h-48 bg-white border border-border rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden group">
                                                        {qrisImage ? (
                                                            <img src={qrisImage} alt="QRIS" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-muted-foreground/30 font-bold text-3xl select-none group-hover:bg-gray-50 transition-colors">
                                                                QRIS
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium block">
                                                        Upload Bukti Transfer
                                                    </label>
                                                    <div className="flex items-center justify-center w-full">
                                                        <label
                                                            htmlFor="dropzone-file"
                                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden"
                                                        >
                                                            {previewUrl ? (
                                                                <div className="relative w-full h-full bg-black/5">
                                                                    <img
                                                                        src={previewUrl}
                                                                        alt="Preview"
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                                                        <span className="text-white text-xs font-medium">Ganti Foto</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <Upload className="size-6 text-gray-400 mb-1" />
                                                                    <p className="text-[10px] text-gray-500 text-center px-4">
                                                                        Tap to upload proof
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <input
                                                                id="dropzone-file"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <DrawerFooter>
                                        {isSuccess ? (
                                            <DrawerClose asChild>
                                                <Button
                                                    className="w-full rounded-full h-12"
                                                    size="lg"
                                                    onClick={() => {
                                                        resetForm();
                                                        setInputValue("");
                                                        setZakatAmount(0);
                                                    }}
                                                >
                                                    Tutup
                                                </Button>
                                            </DrawerClose>
                                        ) : (
                                            <Button
                                                onClick={handlePayment}
                                                disabled={!selectedFile || isSubmitting}
                                                className="w-full rounded-full h-12 text-lg font-semibold"
                                                size="lg"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="animate-spin mr-2" />
                                                ) : null}
                                                {isSubmitting
                                                    ? "Mengirim..."
                                                    : "Konfirmasi Pembayaran"}
                                            </Button>
                                        )}
                                        {!isSuccess && (
                                            <DrawerClose asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-full h-12 border-none text-muted-foreground hover:bg-transparent hover:text-foreground"
                                                >
                                                    Batal
                                                </Button>
                                            </DrawerClose>
                                        )}
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
