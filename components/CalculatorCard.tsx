"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/utils";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Calculator, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import useSnap from "@/hooks/useSnap";
import { toast } from "sonner";

export function CalculatorCard({ qrisImage, programId }: { qrisImage?: string; programId?: string }) {
    const { snapPay } = useSnap();
    const [inputValue, setInputValue] = React.useState("");
    const [zakatAmount, setZakatAmount] = React.useState(0);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);


    // ... code ...

    const handleInstantPayment = async () => {
        if (zakatAmount <= 0) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/payment/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: zakatAmount,
                    itemDetails: [{ id: programId || "zakat-maal", price: zakatAmount, quantity: 1, name: "Zakat Maal" }],
                    customerDetails: { first_name: "Hamba", last_name: "Allah", email: "zakat@allah.com", phone: "08123456789" },
                    paymentType: "SNAP",
                    menuItemId: programId
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

            snapPay(data.token, {
                onSuccess: (result: any) => {
                    setIsSuccess(true);
                    setIsSubmitting(false);
                },
                onPending: (result: any) => {
                    setIsSuccess(true);
                    setIsSubmitting(false);
                },
                onError: (result: any) => {
                    console.error(result);
                    toast.error("Pembayaran gagal");
                    setIsSubmitting(false);
                },
                onClose: () => {
                    setIsSubmitting(false);
                }
            });

        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digit characters
        const rawValue = e.target.value.replace(/\D/g, "");
        setInputValue(rawValue);

        // Calculate 2.5%
        const amount = parseInt(rawValue || "0", 10);
        setZakatAmount(Math.floor(amount * 0.025));
    };

    // Removed manual file upload handlers


    const resetForm = () => {
        setIsSuccess(false);
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
        <Card className="border-none shadow-xl shadow-primary/5 rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-8 pt-6">
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                    <Calculator className="size-5" />
                    Hitung Zakat
                </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4 space-y-6 bg-card px-6 pb-8 pt-6 rounded-t-3xl border-t border-border">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        Masukkan Rezeki Hari Ini
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                            Rp
                        </span>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={formattedValue}
                            onChange={handleInputChange}
                            className="pl-12 h-14 text-lg font-semibold rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="rounded-xl bg-primary/10 p-4 flex flex-col items-center justify-center gap-1 border border-primary/20">
                    <span className="text-sm font-medium text-primary/80">
                        Zakat Kamu (2.5%)
                    </span>
                    <span className="text-2xl font-bold text-primary">
                        {formattedZakat}
                    </span>
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
                            className="w-full h-14 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                            size="lg"
                            disabled={zakatAmount <= 0}
                        >
                            Bayar Sekarang
                            <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-[2rem]">
                        <div className="mx-auto w-full max-w-sm flex flex-col h-full min-h-0">
                            <DrawerHeader className="flex-none">
                                <DrawerTitle className="text-center text-xl">
                                    {isSuccess ? "Pembayaran Berhasil" : "Konfirmasi Pembayaran"}
                                </DrawerTitle>
                            </DrawerHeader>

                            <div className="p-4 pb-0 space-y-6 overflow-y-auto flex-1">
                                {isSuccess ? (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="size-10 text-primary" />
                                        </div>
                                        <p className="text-center text-muted-foreground">
                                            Terima kasih! Bukti pembayaran zakat Anda telah kami terima dan
                                            sedang diverifikasi.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center space-y-4 pt-4">
                                            <div className="bg-primary/5 px-6 py-4 rounded-xl w-full text-center border border-primary/10">
                                                <p className="text-sm text-muted-foreground mb-1">Total Zakat</p>
                                                <span className="font-bold text-primary text-3xl">{formattedZakat}</span>
                                            </div>

                                            <div className="text-center space-y-2 px-4">
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    Insya Allah zakat Anda akan disalurkan kepada yang berhak.
                                                    Silakan lanjut pembayaran aman via Midtrans.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <DrawerFooter className="flex-none pt-4 pb-8 sm:pb-6 bg-white dark:bg-slate-950 border-t border-border z-10">
                                {isSuccess ? (
                                    <DrawerClose asChild>
                                        <Button className="w-full rounded-full h-12" size="lg" onClick={() => {
                                            resetForm();
                                            setInputValue("");
                                            setZakatAmount(0);
                                        }}>Tutup</Button>
                                    </DrawerClose>
                                ) : (
                                    <div className="space-y-3 w-full">
                                        <Button
                                            onClick={handleInstantPayment}
                                            disabled={isSubmitting}
                                            className="w-full rounded-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                            size="lg"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Bayar Zakat Sekarang"}
                                        </Button>
                                    </div>
                                )}
                                {!isSuccess && (
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="w-full rounded-full h-12 border-none text-muted-foreground hover:bg-transparent hover:text-foreground">Batal</Button>
                                    </DrawerClose>
                                )}
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </CardContent>
        </Card>
    );
}
