"use client";

import { useEffect, useState } from "react";
import { Bell, Info, Megaphone, HeartHandshake } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { getRecentNotifications, NotificationItem } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

export function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastRead, setLastRead] = useState<Date | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Load stored last read time
        const stored = localStorage.getItem("notification_last_read");
        const lastReadDate = stored ? new Date(stored) : null;
        setLastRead(lastReadDate);

        // Fetch data
        getRecentNotifications().then(data => {
            setNotifications(data);

            // Calculate unread
            if (!lastReadDate) {
                setUnreadCount(data.length);
            } else {
                const count = data.filter(n => new Date(n.createdAt) > lastReadDate).length;
                setUnreadCount(count);
            }
        });
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Mark all as read after a short delay or immediately
            const now = new Date();
            localStorage.setItem("notification_last_read", now.toISOString());
            setLastRead(now);
            setUnreadCount(0);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "NEWS": return <Megaphone className="size-4 text-orange-500" />;
            case "CAMPAIGN": return <HeartHandshake className="size-4 text-emerald-500" />;
            default: return <Info className="size-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
                    <Bell className="size-5 text-slate-700 dark:text-slate-200" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-950 animate-pulse"></span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] p-0 z-50">
                <DropdownMenuLabel className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900 border-b">
                    <span>Notifikasi</span>
                    {unreadCount > 0 && (
                        <span className="text-xs font-normal text-slate-500">{unreadCount} baru</span>
                    )}
                </DropdownMenuLabel>
                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            Belum ada notifikasi
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((item) => {
                                const isNew = lastRead ? new Date(item.createdAt) > lastRead : true;

                                return (
                                    <DropdownMenuItem key={item.id} className="p-0 focus:bg-transparent cursor-pointer" asChild>
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                "flex gap-3 p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors",
                                                isNew ? "bg-slate-50/80 dark:bg-slate-900/40" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "flex-shrink-0 size-8 rounded-full flex items-center justify-center",
                                                item.type === "NEWS" ? "bg-orange-100 dark:bg-orange-900/30" :
                                                    item.type === "CAMPAIGN" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-100"
                                            )}>
                                                {getIcon(item.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={cn("text-sm font-medium leading-none", isNew ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>
                                                        {item.title}
                                                    </p>
                                                    {isNew && <span className="size-1.5 bg-red-500 rounded-full flex-shrink-0 mt-1" />}
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {item.excerpt}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {moment(item.createdAt).fromNow()}
                                                </p>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-2 text-center">
                    <Link href="/berita" className="text-xs font-semibold text-primary hover:text-primary/90">
                        Lihat Semua Update
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
