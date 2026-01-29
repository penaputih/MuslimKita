import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    backUrl?: string;
    user?: {
        name: string;
        image?: string | null;
    } | null;
}

export function Header({ title, showBack, backUrl = "/", user }: HeaderProps) {
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (
        <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white dark:bg-slate-950 bg-opacity-95 backdrop-blur-sm border-b border-border/40">
            <div className="flex items-center gap-4">
                {showBack && (
                    <Link href={backUrl}>
                        <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8">
                            <ChevronLeft className="size-5" />
                        </Button>
                    </Link>
                )}

                {title ? (
                    <h1 className="text-xl font-bold text-foreground">{title}</h1>
                ) : (
                    <div>
                        <p className="text-muted-foreground text-xs font-medium mb-0.5">
                            Assalamualaikum,
                        </p>
                        <h1 className="text-xl font-bold text-foreground">
                            {user?.name || "Hamba Allah"}
                        </h1>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {today}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!title && (
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <Avatar className="size-9 border-2 border-background shadow-sm">
                        <AvatarImage src={user?.image || "/images/avatar-default.png"} alt={user?.name || "@user"} />
                        <AvatarFallback>
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : "HA"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}
        </header>
    );
}
