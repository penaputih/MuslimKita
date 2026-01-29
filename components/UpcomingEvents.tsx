"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays } from "lucide-react";
import { SerializableEvent } from "@/lib/definitions";

export function UpcomingEvents({ events, showHeader = true }: { events: SerializableEvent[], showHeader?: boolean }) {

    return (
        <section className="px-6 space-y-4 mb-24">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Jadwal Pengajian</h2>
                    <Button variant="link" className="text-primary text-xs h-auto p-0">Lihat Semua</Button>
                </div>
            )}

            <div className="space-y-3">
                {events.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm p-4 bg-white rounded-xl">
                        Belum ada jadwal kajian.
                    </div>
                )}
                {events.map((event) => {
                    const eventDate = new Date(event.date);
                    const day = eventDate.toLocaleDateString('id-ID', { day: 'numeric' });
                    const month = eventDate.toLocaleDateString('id-ID', { month: 'short' });

                    return (
                        <Card key={event.id} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-0 flex">
                                {/* Date Box */}
                                <div className="bg-primary/5 w-20 flex flex-col items-center justify-center border-r border-primary/10 p-2 text-center text-primary shrink-0">
                                    <span className="font-bold text-lg leading-none">{day}</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wide">{month}</span>
                                </div>
                                {/* Content */}
                                <div className="p-3 pl-4 flex-1 space-y-1">
                                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{event.title}</h3>
                                    <p className="text-xs text-muted-foreground font-medium">{event.ustadzName}</p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <CalendarDays className="size-3" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <MapPin className="size-3" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </section>
    );
}
