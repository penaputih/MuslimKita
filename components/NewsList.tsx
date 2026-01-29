"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsItem {
    id: string;
    title: string;
    image: string;
    content: string;
    author: string;
    createdAt: Date;
}

export function NewsList({ news }: { news: NewsItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const cardWidth = 340;
    const gap = 16;
    const totalItemWidth = cardWidth + gap;

    useEffect(() => {
        if (news.length < 3) return;

        const container = scrollRef.current;
        if (!container) return;

        const autoScroll = () => {
            if (isPaused) return;

            const maxScroll = container.scrollWidth - container.clientWidth;

            // If at end, loop back
            if (container.scrollLeft >= maxScroll - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll to next item
                const nextScroll = container.scrollLeft + totalItemWidth;
                container.scrollTo({ left: nextScroll, behavior: 'smooth' });
            }
        };

        const intervalId = setInterval(autoScroll, 4000);

        return () => clearInterval(intervalId);
    }, [news.length, isPaused, totalItemWidth]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        // Calculate index based on scroll position
        const index = Math.round(scrollLeft / totalItemWidth);
        setActiveIndex(Math.min(index, news.length - 1));
    };

    const scrollToItem = (index: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTo({
            left: index * totalItemWidth,
            behavior: 'smooth'
        });
    };

    if (news.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div
                className="w-full overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                ref={scrollRef}
                onScroll={handleScroll}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div className="flex w-max space-x-4 pb-2">
                    {news.map((item) => (
                        <Link href={`/berita/${item.id}`} key={item.id} className="block transition-transform hover:scale-[1.01] active:scale-95">
                            <div
                                className="relative w-[340px] md:w-[400px] h-[200px] rounded-2xl overflow-hidden shadow-md"
                            // Explicit width style to ensure consistency
                            >
                                {/* Background Image */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-5 w-full whitespace-normal">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-sm">
                                        {item.title}
                                    </h3>

                                    <p className="text-white/90 text-xs mb-3 line-clamp-2 font-medium">
                                        {item.content}
                                    </p>

                                    <Button size="sm" className="h-8 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 rounded-full px-4 text-xs font-semibold">
                                        Baca disini!
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Dot Indicators */}
            {news.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {news.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToItem(i)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                i === activeIndex
                                    ? "w-6 bg-emerald-600"
                                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-emerald-400"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
