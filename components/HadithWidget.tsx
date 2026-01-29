"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Hadith {
    id: string;
    text: string;
    source: string;
}

interface HadithWidgetProps {
    hadiths: Hadith[];
    isActive: boolean;
}

export function HadithWidget({ hadiths, isActive }: HadithWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate every 10 seconds if more than 1 hadith
    useEffect(() => {
        if (!isActive || hadiths.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % hadiths.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [hadiths.length, isActive]);

    if (!isActive || hadiths.length === 0) return null;

    const currentHadith = hadiths[currentIndex];

    return (
        <section className="px-6 mb-6">
            <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground border-none shadow-lg overflow-hidden relative h-48 sm:h-64 flex flex-col justify-center">
                <Quote className="absolute top-4 right-4 text-white/10 size-24 -rotate-12" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center justify-center h-full w-full">
                    <div className="flex flex-col items-center text-center space-y-3 w-full">
                        <div className="bg-white/20 p-1.5 rounded-full mb-1">
                            <Quote className="size-4 text-white" />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-2 w-full px-2"
                            >
                                <p className="text-base sm:text-lg font-medium leading-relaxed font-serif italic line-clamp-3">
                                    "{currentHadith.text}"
                                </p>
                                <div className="w-8 h-0.5 bg-white/30 rounded-full mx-auto" />
                                <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    {currentHadith.source}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Indicators if multiple */}
                        {hadiths.length > 1 && (
                            <div className="flex gap-1 mt-1">
                                {hadiths.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-4 bg-white" : "w-1 bg-white/30"}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
