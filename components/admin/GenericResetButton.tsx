"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

interface GenericResetButtonProps {
    category: string;
    onReset: () => Promise<any>;
    label?: string;
}

export function GenericResetButton({ category, onReset, label }: GenericResetButtonProps) {
    const router = useRouter();

    const handleReset = async () => {
        const result = await MySwal.fire({
            title: 'Konfirmasi Reset',
            text: `Anda yakin ingin mereset data ${category} menjadi 0?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Reset Data!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                // Show loading state
                MySwal.fire({
                    title: 'Memproses...',
                    text: 'Sedang mereset data...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        MySwal.showLoading();
                    }
                });

                await onReset();

                await MySwal.fire({
                    title: 'Berhasil!',
                    text: `Data ${category} telah direset.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                router.refresh();
            } catch (error) {
                console.error("Reset Error:", error);
                MySwal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat mereset data.',
                    icon: 'error'
                });
            }
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-500 text-muted-foreground transition-colors"
            title={`Reset ${category}`}
            onClick={handleReset}
            type="button"
        >
            <RefreshCw className="h-3 w-3" />
            <span className="sr-only">Reset {category}</span>
        </Button>
    );
}
