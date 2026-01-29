"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import useSnap from "@/hooks/useSnap";
import { toast } from "sonner"; // Assuming sonner, check if installed or use generic toast
import { useRouter } from "next/navigation";

interface PaymentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    qrisImage?: string | null;
    bankAccount?: string | null;
    title?: string;
    programId?: string; // New prop
    programType?: "campaign" | "menuItem"; // Distinguish FK
    suggestedAmounts?: number[];
    onSuccess?: (amount: number) => void;
}

export function PaymentDrawer({
    isOpen,
    onClose,
    qrisImage,
    bankAccount,
    title = "Donasi Wakaf",
    programId,
    programType = "campaign", // Default to campaign
    onSuccess,
    suggestedAmounts = [50000, 100000, 200000, 500000],
}: PaymentDrawerProps) {
    const { snapPay } = useSnap();
    const router = useRouter(); // Initialize router
    const [step, setStep] = React.useState<"amount" | "payment">("amount");
    const [amount, setAmount] = React.useState<number>(0);
    const [customAmount, setCustomAmount] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
    const [lastPaymentAmount, setLastPaymentAmount] = React.useState<number>(0);

    // Polling function
    const startPollingStatus = async (orderId: string) => {
        let attempts = 0;
        const maxAttempts = 20; // Check for 20 seconds (1s interval)
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/payment/status?orderId=${orderId}`);
                const data = await res.json();

                console.log(`Polling status attempt ${attempts}:`, data.status);

                if (data.status === "VERIFIED") {
                    clearInterval(interval);
                    // setIsSuccess(true); // Disable internal success view to prevent double modal
                    setLastPaymentAmount(amount); // Capture amount for modal
                    onClose(); // Close the drawer first
                    // Redirect to success page
                    router.push(`/payment/success?amount=${amount}`);
                    if (onSuccess) onSuccess(amount);
                    setIsSubmitting(false);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setIsSubmitting(false);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 1000);
    };

    const handleInstantPayment = async () => {
        if (amount <= 0) return;
        setIsSubmitting(true);
        setLastPaymentAmount(amount); // capture init amount

        try {
            const res = await fetch("/api/payment/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amount,
                    itemDetails: [{ id: programId || "general", price: amount, quantity: 1, name: title }],
                    customerDetails: { first_name: "Hamba", last_name: "Allah", email: "hamba@allah.com", phone: "08123456789" }, // Dummy for now
                    paymentType: "SNAP",
                    campaignId: programType === "campaign" ? programId : undefined,
                    menuItemId: programType === "menuItem" ? programId : undefined
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

            snapPay(data.token, {
                onSuccess: (result: any) => {
                    // Start polling to confirm and sync status
                    startPollingStatus(data.orderId);
                },
                onPending: (result: any) => {
                    toast.info("Menunggu Pembayaran...", {
                        description: "Sistem sedang mengecek status pembayaran Anda."
                    });
                    // Start polling immediately because user might have just paid
                    startPollingStatus(data.orderId);
                },
                onError: (result: any) => {
                    console.error(result);
                    toast.error("Pembayaran gagal");
                    setIsSubmitting(false);
                },
                onClose: () => {
                    // Also poll on close, just in case they paid and verify wasn't instant
                    startPollingStatus(data.orderId);
                    setIsSubmitting(false);
                }
            });

        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            // toast.error("Terjadi kesalahan");
        }
    };



    // Reset when closed
    React.useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep("amount");
                setAmount(0);
                setCustomAmount("");
                setIsSuccess(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleAmountSelect = (value: number) => {
        setAmount(value);
        setCustomAmount("");
        setStep("payment");
    };

    const handleCustomAmountSubmit = () => {
        const value = parseInt(customAmount.replace(/\D/g, "") || "0");
        if (value > 0) {
            setAmount(value);
            setStep("payment");
        }
    };

    const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);

    return (
        <>
            <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-[2rem] max-w-[540px] mx-auto inset-x-0">
                    <div className="mx-auto w-full max-w-sm flex flex-col h-full min-h-0">
                        <DrawerHeader className="flex-none">
                            <DrawerTitle className="text-center text-xl">
                                {isSuccess ? "Pembayaran Berhasil" : title}
                            </DrawerTitle>
                        </DrawerHeader>

                        <div className="p-4 pb-0 space-y-6 overflow-y-auto flex-1 h-full">
                            {isSuccess ? (
                                <div className="p-6 text-center space-y-4">
                                    <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div className="size-8 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                                            <span className="text-emerald-600 text-lg font-bold">✓</span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Pembayaran Berhasil</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Jazakumullah Khairan! donasi Anda telah kami terima dan tercatat dalam sistem. Semoga menjadi amal jariyah.
                                    </p>
                                </div>
                            ) : step === "amount" ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        {suggestedAmounts.map((val) => (
                                            <Button
                                                key={val}
                                                variant="outline"
                                                className="h-12 hover:border-primary hover:text-primary hover:bg-primary/5"
                                                onClick={() => handleAmountSelect(val)}
                                            >
                                                <span suppressHydrationWarning>
                                                    {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(val)}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Atau masukkan nominal lain</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                className="pl-12 h-12 text-lg font-semibold"
                                                placeholder="0"
                                                value={customAmount ? new Intl.NumberFormat("id-ID").format(parseInt(customAmount)) : ""}
                                                onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, ""))}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full rounded-full h-12 font-bold mb-4"
                                        onClick={handleCustomAmountSubmit}
                                        disabled={!customAmount || parseInt(customAmount) <= 0}
                                    >
                                        Lanjut
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            ) : (

                                // Payment Step
                                <div className="animate-in slide-in-from-right-8 duration-300 pb-4">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="bg-primary/5 px-6 py-4 rounded-xl w-full text-center">
                                            <p className="text-sm text-muted-foreground mb-1">Total {title}</p>
                                            <span className="font-bold text-primary text-3xl" suppressHydrationWarning>{formattedAmount}</span>
                                        </div>

                                        <div className="w-full text-center space-y-2 px-4">
                                            <p className="text-muted-foreground text-sm">
                                                Anda akan diarahkan ke halaman pembayaran aman Midtrans.
                                                Mendukung QRIS, GoPay, ShopeePay, Transfer Bank, dll.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DrawerFooter className="flex-none pt-4 pb-8 sm:pb-6 bg-white dark:bg-slate-950 border-t border-border z-10">
                            {isSuccess ? (
                                <DrawerClose asChild>
                                    <Button className="w-full rounded-full h-12" size="lg" onClick={onClose}>Tutup</Button>
                                </DrawerClose>
                            ) : step === "payment" ? (

                                <div className="space-y-3 w-full">
                                    <Button
                                        onClick={handleInstantPayment}
                                        disabled={isSubmitting}
                                        className="w-full rounded-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                        size="lg"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Lanjut Pembayaran"}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-full"
                                        onClick={() => setStep("amount")}
                                        disabled={isSubmitting}
                                    >
                                        Kembali
                                    </Button>
                                </div>
                            ) : (
                                <DrawerClose asChild>
                                    <Button variant="ghost" className="w-full rounded-full h-12 text-muted-foreground">Batal</Button>
                                </DrawerClose>
                            )}
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>


        </>
    );
}
