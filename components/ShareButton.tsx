
"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string; // Optional, defaults to current window.location.href
    className?: string;
}

export function ShareButton({ title = "MuslimKita", text = "Mari berbagi kebaikan.", url, className }: ShareButtonProps) {
    const handleShare = async () => {
        const shareData = {
            title: "MuslimKita",
            text: `${title}\n\nBaca selengkapnya di MuslimKita:`,
            url: url || window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link berhasil disalin!");
            } catch (err) {
                toast.error("Gagal menyalin link.");
            }
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className || "rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-white backdrop-blur-sm"}
            onClick={handleShare}
        >
            <Share2 className="size-5" />
        </Button>
    );
}
