"use client";

import { useState } from "react";
import { Surah } from "@/lib/api";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ChevronRight } from "lucide-react";

interface SurahProps {
    surahs: Surah[];
}

export function SurahList({ surahs }: SurahProps) {
    const [search, setSearch] = useState("");

    const filteredSurahs = surahs.filter((surah) =>
        surah.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
        surah.arti.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 -mx-4 shadow-sm border-b border-neutral-100 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <Input
                        placeholder="Cari surat... (Contoh: Yasin)"
                        className="pl-10 h-12 bg-neutral-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 rounded-xl text-lg dark:text-slate-100 dark:placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredSurahs.map((surah) => (
                    <Link
                        key={surah.nomor}
                        href={`/quran/${surah.nomor}`}
                        className="group bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    {/* Star Octagon Shape */}
                                    <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/40 rotate-45 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors"></div>
                                    <span className="relative font-bold text-emerald-700 dark:text-emerald-400">{surah.nomor}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-800 dark:text-slate-100 text-lg group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                        {surah.namaLatin}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-slate-400">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-amiri text-2xl text-emerald-800 dark:text-emerald-500" dir="rtl">{surah.nama}</p>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredSurahs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-neutral-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Tidak ditemukan surat "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
