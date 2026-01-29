"use client";

import { useEffect, useState } from "react";
import { getSurahDetail, SurahDetail } from "@/lib/api";
import { Header } from "@/components/Header";
import { AyahList } from "@/app/quran/[id]/ayah-list";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientQuranDetailProps {
    id: string;
}

export function ClientQuranDetail({ id }: ClientQuranDetailProps) {
    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const num = parseInt(id);
            if (isNaN(num)) throw new Error("Invalid ID");

            const data = await getSurahDetail(num);
            if (data) {
                setSurah(data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-white pb-28 flex flex-col items-center justify-center">
                <Header title="Memuat..." showBack backUrl="/quran" />
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-sm text-neutral-500">Mengambil data surat...</p>
                </div>
            </main>
        );
    }

    if (error || !surah) {
        return (
            <main className="min-h-screen bg-white pb-28">
                <Header title="Error" showBack backUrl="/quran" />
                <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
                    <p className="text-red-500 font-medium mb-2">Gagal memuat surat</p>
                    <p className="text-sm text-neutral-500 mb-6">Terjadi kesalahan saat mengambil data dari server.</p>
                    <Button onClick={fetchData} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Coba Lagi
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pb-28">
            <Header title={surah.namaLatin} showBack backUrl="/quran" />

            {/* Surah Info Card (Duplicated from Server Page) */}
            <div className="bg-emerald-600 text-white px-6 pt-4 pb-8 -mt-1 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 text-center">
                    <h2 className="font-amiri text-3xl mb-1">{surah.nama}</h2>
                    <p className="text-emerald-100 text-sm">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                    <p className="text-xs text-emerald-200/80 mt-2 max-w-xs mx-auto line-clamp-2">
                        {surah.deskripsi.replace(/<\/?[^>]+(>|$)/g, "")}
                    </p>
                </div>
            </div>

            <div className="px-4">
                <AyahList surah={surah} />
            </div>

            <FloatingBottomNav />
        </main>
    );
}
