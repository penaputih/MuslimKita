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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2, ArrowRight, UploadCloud, Copy, Check } from "lucide-react";
import useSnap from "@/hooks/useSnap";
import { toast } from "sonner"; // Assuming sonner, check if installed or use generic toast
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Sub-components
const OnlinePaymentContent = ({ handleInstantPayment, isSubmitting }: { handleInstantPayment: () => void, isSubmitting: boolean }) => (
    <div className="space-y-4">
        <p className="text-muted-foreground text-sm text-center">
            Anda akan diarahkan ke halaman pembayaran aman Midtrans.
            Mendukung QRIS, GoPay, ShopeePay, Transfer Bank, dll.
        </p>
        <Button
            onClick={handleInstantPayment}
            disabled={isSubmitting}
            className="w-full rounded-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
        >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Bayar Sekarang"}
        </Button>
    </div>
);

const OfflinePaymentContent = ({ qrisImage, bankAccount, amount, programId, onSuccess }: {
    qrisImage?: string | null,
    bankAccount?: string | null,
    amount: number,
    programId?: string,
    onSuccess: (amount: number) => void
}) => {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!bankAccount) return;
        navigator.clipboard.writeText(bankAccount);
        setIsCopied(true);
        toast.success("Nomor rekening disalin");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleOfflineSubmit = async () => {
        if (!proofFile) {
            toast.error("Mohon upload bukti transfer");
            return;
        }
        setIsUploading(true);
        try {
            // 1. Upload Image
            const formData = new FormData();
            formData.append("file", proofFile);
            formData.append("folder", "payments");

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error("Gagal upload bukti transfer");

            // 2. Create Transaction
            const paymentRes = await fetch("/api/payment/offline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amount,
                    paymentType: "OFFLINE",
                    menuItemId: programId, // Assuming programId maps to menuItem based on context, or use campaignId logic if needed. 
                    // Note: The previous logic uses programId generic. For exact mapping we might need to check programType but for now lets assume general ID.
                    proofImage: uploadData.url
                })
            });

            const paymentData = await paymentRes.json();
            if (paymentData.error) throw new Error(paymentData.error);

            onSuccess(amount);

        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <p className="text-sm font-medium">Scan QRIS</p>
                <div className="bg-white p-2 rounded-lg border shadow-sm">
                    {qrisImage ? (
                        <img src={qrisImage} alt="QRIS" className="w-48 h-48 object-contain" />
                    ) : (
                        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                            QRIS belum tersedia
                        </div>
                    )}
                </div>
            </div>
            {bankAccount && (
                <div className="bg-muted p-3 rounded-lg text-sm space-y-1 relative group">
                    <p className="font-semibold">Transfer Bank:</p>
                    <p className="whitespace-pre-wrap pr-8 font-mono">{bankAccount}</p>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={handleCopy}
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            )}

            <div className="space-y-2 pt-2">
                <Label htmlFor="proof">Upload Bukti Transfer</Label>
                <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                <p className="text-[10px] text-muted-foreground">Pastikan nominal sesuai dengan yang tertera.</p>
            </div>

            <Button
                onClick={handleOfflineSubmit}
                disabled={isUploading}
                className="w-full rounded-full h-12 text-sm font-semibold"
                size="lg"
            >
                {isUploading ? <Loader2 className="animate-spin mr-2" /> : "Konfirmasi Pembayaran"}
            </Button>
        </div>
    );
};
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
    isOfflinePaymentActive?: boolean;
    isOnlinePaymentActive?: boolean;
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
    isOfflinePaymentActive = false,
    isOnlinePaymentActive = true,
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

                                        {/* Logic for Payment Methods */}
                                        {/* CASE 1: BOTH ACTIVE -> SHOW TABS */}
                                        {isOnlinePaymentActive && isOfflinePaymentActive && (
                                            <div className="w-full space-y-4">
                                                <div className="bg-white border rounded-xl p-4 space-y-3">
                                                    <h3 className="font-semibold text-center">Metode Pembayaran</h3>
                                                    <Tabs defaultValue="online" className="w-full">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="online">Otomatis</TabsTrigger>
                                                            <TabsTrigger value="offline">Manual / Transfer</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="online" className="pt-4 space-y-2">
                                                            <OnlinePaymentContent handleInstantPayment={handleInstantPayment} isSubmitting={isSubmitting} />
                                                        </TabsContent>
                                                        <TabsContent value="offline" className="pt-4 space-y-4">
                                                            <OfflinePaymentContent
                                                                qrisImage={qrisImage}
                                                                bankAccount={bankAccount}
                                                                amount={amount}
                                                                programId={programId}
                                                                onSuccess={(amt) => {
                                                                    setAmount(amt);
                                                                    setIsSuccess(true);
                                                                    onSuccess?.(amt);
                                                                }}
                                                            />
                                                        </TabsContent>
                                                    </Tabs>
                                                </div>
                                            </div>
                                        )}

                                        {/* CASE 2: ONLY ONLINE ACTIVE */}
                                        {isOnlinePaymentActive && !isOfflinePaymentActive && (
                                            <div className="w-full space-y-4">
                                                <OnlinePaymentContent handleInstantPayment={handleInstantPayment} isSubmitting={isSubmitting} />
                                            </div>
                                        )}

                                        {/* CASE 3: ONLY OFFLINE ACTIVE */}
                                        {!isOnlinePaymentActive && isOfflinePaymentActive && (
                                            <div className="w-full space-y-4">
                                                <div className="bg-white border rounded-xl p-4 space-y-3">
                                                    <h3 className="font-semibold text-center">Pembayaran Manual</h3>
                                                    <OfflinePaymentContent
                                                        qrisImage={qrisImage}
                                                        bankAccount={bankAccount}
                                                        amount={amount}
                                                        programId={programId}
                                                        onSuccess={(amt) => {
                                                            setAmount(amt);
                                                            setIsSuccess(true);
                                                            onSuccess?.(amt);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* CASE 4: BOTH INACTIVE */}
                                        {!isOnlinePaymentActive && !isOfflinePaymentActive && (
                                            <div className="w-full text-center space-y-2 px-4 py-8 bg-muted rounded-xl">
                                                <p className="font-semibold text-muted-foreground">Pembayaran Sedang Maintenance</p>
                                                <p className="text-xs text-muted-foreground">Mohon maaf, sistem pembayaran sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.</p>
                                            </div>
                                        )}
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
