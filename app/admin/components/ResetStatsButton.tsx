"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { resetProgramStats } from "../actions";
import { useState } from "react";

interface ResetStatsButtonProps {
    menuItemId: string;
    programName: string;
}

export default function ResetStatsButton({ menuItemId, programName }: ResetStatsButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const result = await resetProgramStats(menuItemId);
            if (result.success) {
                toast.success(`Statistik untuk ${programName} berhasil di-reset.`);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                    <RotateCcw className="h-3 w-3" />
                    <span className="sr-only">Reset Statistik</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Perhitungan Donasi?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda akan me-reset perhitungan "Total Terkumpul" untuk <strong>{programName}</strong> menjadi 0.
                        <br /><br />
                        Data transaksi <strong>TIDAK AKAN DIHAPUS</strong>, hanya perhitungan tampilan yang di-reset mulai dari sekarang.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isLoading ? "Memproses..." : "Ya, Reset"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
