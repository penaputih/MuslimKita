import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { ShareButton } from "@/components/ShareButton";

export default async function BeritaDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Fetch from DB
    const news = await prisma.news.findUnique({
        where: { id },
    });

    if (!news) {
        notFound();
    }

    const isUrl = news.image.startsWith('http') || news.image.startsWith('/');
    const isBase64 = news.image.startsWith('data:');
    const bgImage = isUrl || isBase64 ? `url(${news.image})` : undefined;
    const bgClass = !bgImage ? news.image : '';

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pb-28">
            {/* Custom Header for Detail */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
                <Link href="/berita">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="size-6" />
                    </Button>
                </Link>
                <span className="font-semibold text-sm">Detail Berita</span>
                <ShareButton
                    title={news.title}
                    text={news.content ? news.content.substring(0, 100) + "..." : "Baca berita ini di DISA - Daarussyifa Islamic Super App."}
                    className="rounded-full"
                />
            </div>

            <article>
                {/* Visual Header */}
                <div className="w-full relative aspect-video bg-muted">
                    {bgImage ? (
                        <img
                            src={news.image}
                            alt={news.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>

                <div className="px-6 py-6 space-y-4">
                    <Badge variant="secondary" className="rounded-md bg-muted text-muted-foreground font-medium">
                        Berita
                    </Badge>

                    <h1 className="text-2xl font-bold leading-tight text-foreground">
                        {news.title}
                    </h1>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-b border-border pb-6">
                        <div className="flex items-center gap-1.5">
                            <div className="size-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <UserIcon className="size-3" />
                            </div>
                            <span className="font-medium">{news.author}</span>
                        </div>
                        <div className="w-px h-3 bg-border" />
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="size-4" />
                            <span>{news.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div
                        className="prose prose-sm prose-neutral dark:prose-invert max-w-none pt-2 whitespace-pre-wrap"
                    >
                        {news.content}
                    </div>
                </div>
            </article>

            <FloatingBottomNav />
        </main>
    );
}
