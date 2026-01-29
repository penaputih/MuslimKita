import { getSurahDetail, getTafsir } from "@/lib/api";
import { Header } from "@/components/Header";
import { AyahList } from "./ayah-list";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { notFound } from "next/navigation";
import { ClientQuranDetail } from "@/components/ClientQuranDetail";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuranDetailPage({ params }: PageProps) {
    const { id } = await params;
    const surahNumber = parseInt(id);

    if (isNaN(surahNumber)) notFound();

    // Fetch both Surah and Tafsir in parallel
    const [surah, tafsirData] = await Promise.all([
        getSurahDetail(surahNumber),
        getTafsir(surahNumber)
    ]);

    if (!surah) {
        return <ClientQuranDetail id={id} />;
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pb-28">
            <Header title={surah.namaLatin} showBack backUrl="/quran" />

            {/* Surah Info Card */}
            <div className="bg-emerald-600 text-white px-6 pt-4 pb-8 -mt-1 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 text-center">
                    <h2 className="font-amiri text-3xl mb-1">{surah.nama}</h2>
                    <p className="text-emerald-100 text-sm">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                    <p className="text-xs text-emerald-200/80 mt-2 max-w-xs mx-auto line-clamp-2">
                        {surah.deskripsi.replace(/<\/?[^>]+(>|$)/g, "")}
                    </p>

                    {/* Tafsir Button */}
                    <div className="mt-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-white border-0">
                                    <BookOpenText className="size-4" />
                                    Baca Tafsir
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Tafsir Surat {surah.namaLatin}</DialogTitle>
                                    <DialogDescription>
                                        Sumber: Kemenag RI
                                    </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="ayat" className="w-full flex-1 flex flex-col overflow-hidden">
                                    <TabsList className="grid w-full grid-cols-2 mb-2">
                                        <TabsTrigger value="surah">Info & Ringkasan</TabsTrigger>
                                        <TabsTrigger value="ayat">Per Ayat</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="surah" className="flex-1 overflow-hidden mt-0 text-left">
                                        <ScrollArea className="h-[50vh] pr-4">
                                            <div
                                                className="text-sm leading-relaxed text-justify space-y-4 prose prose-sm max-w-none text-neutral-600 dark:text-slate-300 dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: surah.deskripsi }}
                                                suppressHydrationWarning={true}
                                            />
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="ayat" className="flex-1 overflow-hidden mt-0 text-left">
                                        <ScrollArea className="h-[50vh] pr-4">
                                            <div className="text-sm leading-relaxed text-justify space-y-4">
                                                {tafsirData?.tafsir ? (
                                                    tafsirData.tafsir.map((item) => (
                                                        <div key={item.ayat} className="pb-4 border-b border-dashed border-neutral-200 dark:border-slate-800 last:border-0">
                                                            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
                                                                Ayat {item.ayat}
                                                            </span>
                                                            <p className="text-neutral-700 dark:text-slate-300">{item.teks}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted-foreground italic text-center py-8">Tafsir per ayat tidak tersedia.</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="px-4">
                <AyahList surah={surah} tafsir={tafsirData?.tafsir || []} />
            </div>

            <FloatingBottomNav />
        </main>
    );
}
