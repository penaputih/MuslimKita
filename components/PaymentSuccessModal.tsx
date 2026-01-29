
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
}

const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: "10px",
    height: "10px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export function PaymentSuccessModal({ isOpen, onClose, amount }: PaymentSuccessModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowConfetti(true), 300);
        } else {
            setShowConfetti(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-0 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <Confetti active={showConfetti} config={confettiConfig} />
                </div>

                <div className="flex flex-col items-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-emerald-700 dark:text-emerald-400 font-serif">
                            Alhamdulillah
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                        <p className="font-medium text-lg text-slate-800 dark:text-slate-100">
                            Pembayaran Berhasil!
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white my-4">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Jazakumullah Khairan Katsiran.<br />
                            Semoga Allah menerima amal ibadah Anda dan membalasnya dengan kebaikan yang berlipat ganda. Aamiin.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 w-full mt-4">
                        <p className="italic text-slate-600 dark:text-slate-400 text-sm font-serif leading-relaxed">
                            "Sesungguhnya orang-orang yang bersedekah baik laki-laki maupun perempuan dan meminjamkan kepada Allah pinjaman yang baik, niscaya akan dilipat-gandakan (pembayarannya) kepada mereka; dan bagi mereka pahala yang banyak."
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-semibold">— QS. Al-Hadid: 18</p>
                    </div>

                    <Button
                        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base font-semibold"
                        onClick={onClose}
                    >
                        <HeartHandshake className="w-5 h-5 mr-2" />
                        Kembali ke Aplikasi
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
