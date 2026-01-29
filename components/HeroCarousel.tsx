"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HeroCarousel({ slides }: { slides: any[] }) {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    if (!slides || slides.length === 0) {
        return null; // Or render a default fallback
    }

    return (
        <div className="w-full px-6 mb-6">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div className="p-1">
                                <Card className="border-none shadow-md overflow-hidden aspect-video text-white flex flex-col justify-end relative h-48 sm:h-64 rounded-2xl">
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

                                    <CardContent className="relative z-20 pb-6 pl-6 pr-12">
                                        <h3 className="text-xl font-bold mb-1 leading-tight">{slide.title}</h3>
                                        {slide.subtitle && (
                                            <p className="text-sm text-gray-200 mb-3 line-clamp-2 opacity-90">{slide.subtitle}</p>
                                        )}
                                        {slide.ctaText && (
                                            <Button size="sm" variant="secondary" className="h-8 text-xs font-semibold rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30" asChild>
                                                <a href={slide.ctaLink || "#"}>{slide.ctaText}</a>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
