"use client";

import { useEffect, useState } from "react";
import { DoaItem, getDoaList } from "@/lib/doa-api";
import { DZIKIR_PAGI, DZIKIR_PETANG, DzikirItem } from "@/data/dzikir";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookHeart, ChevronDown, ChevronLeft, ChevronUp, Copy, Share2, Moon, Sun, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DoaDzikirPage() {
    const [doas, setDoas] = useState<DoaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [tag, setTag] = useState("all");

    // Accordion State for Doa
    const [expandedDoa, setExpandedDoa] = useState<string | number | null>(null);

    const { toast } = useToast();

    const fetchDoas = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getDoaList();
            if (data.length === 0) throw new Error("No data");
            setDoas(data);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoas();
    }, []);

    const filteredDoas = doas.filter(d => {
        const matchesSearch = d.doa.toLowerCase().includes(search.toLowerCase()) ||
            d.artinya.toLowerCase().includes(search.toLowerCase()) ||
            d.ayat.includes(search); // Search in Arabic too? Optional.

        // Mock Category Logic: Check if title contains the category keyword
        const matchesCategory = category === "all" || d.doa.toLowerCase().includes(category.toLowerCase());

        // Mock Tag Logic: For now, "all" matches everything as we don't have real tags
        const matchesTag = tag === "all";

        return matchesSearch && matchesCategory && matchesTag;
    });

    const handleCopy = (title: string, arab: string, translation: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const text = `${title}\n\n${arab}\n\n"${translation}"\n\n- DISA App`;
        navigator.clipboard.writeText(text);
        toast({ description: "Berhasil disalin" });
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-neutral-100 dark:border-slate-800">
                <div className="px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8 shrink-0">
                                <ChevronLeft className="size-5" />
                            </Button>
                        </Link>
                        <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <BookHeart className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Doa & Dzikir</h1>
                            <p className="text-xs text-slate-500">Harian & Rutinitas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4">
                <Tabs defaultValue="doa" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-12 items-center">
                        <TabsTrigger
                            value="doa"
                            className="rounded-lg h-10 w-full flex items-center justify-center data-[state=active]:!bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                        >
                            Doa Harian
                        </TabsTrigger>
                        <TabsTrigger
                            value="dzikir"
                            className="rounded-lg h-10 w-full flex items-center justify-center data-[state=active]:!bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                        >
                            Dzikir Pagi & Petang
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: DOA */}
                    <TabsContent value="doa" className="space-y-4">
                        {/* Search */}
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Cari doa..."
                                className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-10 space-y-2">
                                <div className="animate-spin size-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
                                <p className="text-slate-400 text-sm">Memuat doa...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 space-y-4">
                                <p className="text-red-500 text-sm">Gagal memuat doa.</p>
                                <Button size="sm" variant="outline" onClick={fetchDoas} className="gap-2">
                                    <RefreshCcw className="size-4" /> Coba Lagi
                                </Button>
                            </div>
                        ) : filteredDoas.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">Doa tidak ditemukan.</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDoas.map((doa) => {
                                    const isExpanded = expandedDoa === doa.id;
                                    return (
                                        <Card
                                            key={doa.id}
                                            className={`border transition-all duration-200 overflow-hidden cursor-pointer ${isExpanded ? 'ring-1 ring-amber-200 shadow-md' : 'shadow-sm border-slate-100 dark:border-slate-800'}`}
                                            onClick={() => setExpandedDoa(isExpanded ? null : doa.id)}
                                        >
                                            <div className="p-4 flex items-center justify-between">
                                                <h3 className={`font-medium text-sm md:text-base ${isExpanded ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {doa.doa}
                                                </h3>
                                                {isExpanded ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                                            </div>

                                            {/* Accordion Content */}
                                            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="px-4 pb-4 pt-0 space-y-4 border-t border-slate-50 dark:border-slate-900/50 mt-2">
                                                        <p className="font-arab text-2xl text-right leading-loose text-slate-800 dark:text-slate-100 mt-4" dir="rtl">
                                                            {doa.ayat}
                                                        </p>
                                                        <div className="bg-amber-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 italic border border-amber-100 dark:border-slate-800">
                                                            "{doa.artinya}"
                                                        </div>
                                                        <div className="flex justify-start pt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 gap-2 text-slate-400 hover:text-amber-600"
                                                                onClick={(e) => handleCopy(doa.doa, doa.ayat, doa.artinya, e)}
                                                            >
                                                                <Copy className="size-3" /> Salin
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB: DZIKIR */}
                    <TabsContent value="dzikir" className="space-y-6">
                        {/* Pagi */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Sun className="size-4 text-orange-500" />
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">Dzikir Pagi</h2>
                            </div>
                            <div className="space-y-3">
                                {DZIKIR_PAGI.map((item) => (
                                    <DzikirCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>

                        {/* Petang */}
                        <section>
                            <div className="flex items-center gap-2 mb-3 mt-6">
                                <Moon className="size-4 text-indigo-500" />
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">Dzikir Petang</h2>
                            </div>
                            <div className="space-y-3">
                                {DZIKIR_PETANG.map((item) => (
                                    <DzikirCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>
            </div>

            <FloatingBottomNav />
        </main>
    );
}

function DzikirCard({ item }: { item: DzikirItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                        {item.ulang}x
                    </Badge>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.title}</span>
                </div>
                {isOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
            </div>

            {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-900 pt-4">
                    <p className="font-arab text-2xl text-right leading-loose mb-4">{item.arab}</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2 font-medium">{item.latin}</p>
                    <p className="text-xs text-slate-500">{item.terjemahan}</p>
                </div>
            )}
        </Card>
    );
}
