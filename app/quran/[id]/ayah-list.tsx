"use client";

import { SurahDetail, Ayah } from "@/lib/api";
import { Play, Pause, BookOpenText, Copy, Share2, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";

interface AyahListProps {
    surah: SurahDetail;
    tafsir?: { ayat: number; teks: string }[];
}

export function AyahList({ surah, tafsir }: AyahListProps) {
    const { toast } = useToast();

    // Audio State
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [isPlayingFull, setIsPlayingFull] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Tafsir State
    const [selectedTafsir, setSelectedTafsir] = useState<{ ayat: number; teks: string } | null>(null);

    // Copy State (visualization)
    const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

    // Stop audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingAyah(null);
        setIsPlayingFull(false);
    };

    const toggleFullAudio = () => {
        const audioUrl = surah.audioFull["05"];
        if (!audioUrl) {
            toast({
                variant: "destructive",
                description: "Maaf, audio full untuk surat ini belum tersedia.",
            });
            return;
        }

        if (isPlayingFull) {
            stopAudio();
        } else {
            stopAudio(); // Ensure other audios stop
            const audio = new Audio(audioUrl); // Using Misyari Rasyid
            audioRef.current = audio;
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                toast({ variant: "destructive", description: "Gagal memutar audio." });
                setIsPlayingFull(false);
            });
            audio.onended = () => setIsPlayingFull(false);
            setIsPlayingFull(true);
        }
    };

    const toggleAyahAudio = (index: number, audioUrl: string) => {
        if (playingAyah === index) {
            stopAudio();
        } else {
            stopAudio(); // Ensure other audios stop
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.play();
            audio.onended = () => setPlayingAyah(null);
            setPlayingAyah(index);
        }
    };

    const handleCopy = (ayah: Ayah) => {
        const textToCopy = `QS. ${surah.namaLatin}: ${ayah.nomorAyat}\n\n${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\n- DISA App`;
        navigator.clipboard.writeText(textToCopy);

        setCopiedAyah(ayah.nomorAyat);
        toast({
            description: "Ayat berhasil disalin",
            duration: 2000,
        });

        setTimeout(() => setCopiedAyah(null), 2000);
    };

    const handleShare = async (ayah: Ayah) => {
        const shareData = {
            title: `QS. ${surah.namaLatin}: ${ayah.nomorAyat}`,
            text: `QS. ${surah.namaLatin}: ${ayah.nomorAyat}\n\n${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\nVia DISA App`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            handleCopy(ayah); // Fallback to copy
        }
    };

    const openTafsir = (nomorAyat: number) => {
        if (!tafsir) {
            toast({
                variant: "destructive",
                description: "Tafsir belum dimuat.",
            });
            return;
        }
        const item = tafsir.find(t => t.ayat === nomorAyat);
        if (item) {
            setSelectedTafsir(item);
        } else {
            toast({
                variant: "destructive",
                description: "Tafsir untuk ayat ini belum tersedia.",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-center mb-6">
                <Button
                    onClick={toggleFullAudio}
                    className={`rounded-full gap-2 transition-all ${isPlayingFull
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg ring-4 ring-emerald-100"
                        : "bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                        }`}
                >
                    {isPlayingFull ? (
                        <>
                            <Pause className="size-4 fill-current" />
                            <span className="font-medium">Jeda Murottal Full</span>
                        </>
                    ) : (
                        <>
                            <Play className="size-4 fill-current" />
                            <span className="font-medium">Putar Murottal Full</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Bismillah */}
            <div className="text-center py-8 bg-neutral-50 dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800 mb-8 font-arab text-3xl text-emerald-800 dark:text-emerald-400">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
            </div>

            {/* Ayah List */}
            <div className="space-y-8 divide-y divide-neutral-100 dark:divide-slate-800">
                {surah.ayat.map((ayah, index) => (
                    <div key={ayah.nomorAyat} id={`ayah-${ayah.nomorAyat}`} className="pt-6">
                        {/* Number Badge */}
                        <div className="flex items-center mb-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold rounded-l-lg rounded-tr-lg text-sm font-arab">
                                {ayah.nomorAyat}
                            </span>
                        </div>

                        {/* Arabic Text */}
                        <p
                            className="font-arab text-3xl md:text-4xl text-right leading-loose md:leading-[2.5] text-neutral-800 dark:text-slate-100 mb-6 px-1"
                            dir="rtl"
                        >
                            {ayah.teksArab}
                        </p>

                        {/* Translation */}
                        <div className="space-y-2 pl-2 border-l-4 border-emerald-100 dark:border-emerald-900 mb-4">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                                {ayah.teksLatin}
                            </p>
                            <p className="text-neutral-600 dark:text-slate-400 leading-relaxed">
                                {ayah.teksIndonesia}
                            </p>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAyahAudio(index, ayah.audio["05"])}
                                className={`gap-2 h-8 rounded-full ${playingAyah === index ? "text-emerald-600 bg-emerald-50" : "text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
                            >
                                {playingAyah === index ? <Pause className="size-4" /> : <Play className="size-4" />}
                                <span className="text-xs font-medium">Play</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openTafsir(ayah.nomorAyat)}
                                className="gap-2 h-8 rounded-full text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                                <BookOpenText className="size-4" />
                                <span className="text-xs font-medium">Tafsir</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(ayah)}
                                className="gap-2 h-8 rounded-full text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                                {copiedAyah === ayah.nomorAyat ? <Check className="size-4" /> : <Copy className="size-4" />}
                                <span className="text-xs font-medium">Salin</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(ayah)}
                                className="gap-2 h-8 rounded-full text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                                <Share2 className="size-4" />
                                <span className="text-xs font-medium">Bagikan</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tafsir Dialog (Controlled) */}
            <Dialog open={!!selectedTafsir} onOpenChange={(open) => !open && setSelectedTafsir(null)}>
                <DialogContent className="max-h-[80vh] flex flex-col sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tafsir Ayat {selectedTafsir?.ayat}</DialogTitle>
                        <DialogDescription>Sumber: Kemenag RI</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <div className="text-sm leading-loose text-left pb-4 whitespace-pre-wrap">
                            {selectedTafsir?.teks}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
