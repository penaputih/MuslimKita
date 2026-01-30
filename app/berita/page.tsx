import { Header } from "@/components/Header";
// import { Footer } from "@/components/Footer"; // Footer component missing, removing import // Assuming Footer was meant to be FloatingBottomNav or similar, but layout shows FloatingBottomNav
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CalendarIcon, UserIcon } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function BeritaPage() {
    const session = await getSession();
    const news = await prisma.news.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            <Header user={session?.user} showBack={true} />

            <div className="px-6 pt-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold mb-2">Berita & Update</h2>
                    <p className="text-muted-foreground text-sm">Informasi terbaru seputar kegiatan majlis dan laporan.</p>
                </div>

                <div className="space-y-4">
                    {news.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground bg-white rounded-xl shadow-sm">
                            Belum ada berita yang diterbitkan.
                        </div>
                    )}
                    {news.map((item: any) => {
                        const isUrl = item.image.startsWith('http') || item.image.startsWith('/');
                        const isBase64 = item.image.startsWith('data:');
                        const bgImage = isUrl || isBase64 ? `url(${item.image})` : undefined;
                        const bgClass = !bgImage ? item.image : '';

                        return (
                            <Link key={item.id} href={`/berita/${item.id}`} className="block group">
                                <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white hover:shadow-md transition-all">
                                    <div
                                        className={`h-40 w-full relative bg-cover bg-center ${bgClass}`}
                                        style={{ backgroundImage: bgImage }}
                                    >
                                        {!bgImage && !bgClass && <div className="w-full h-full bg-slate-200"></div>}
                                    </div>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="size-3" />
                                                <span>{item.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <UserIcon className="size-3" />
                                                <span>{item.author}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.content.substring(0, 100)}...
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <FloatingBottomNav />
        </main>
    );
}
