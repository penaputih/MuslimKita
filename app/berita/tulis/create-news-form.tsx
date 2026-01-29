"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { createNews } from "./actions"; // Import the server action
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function CreateNewsForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = await createNews(formData);
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success("Berita berhasil dikirim!");
                // Redirect is handled in the server action, but we can do it here too if needed
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-none bg-transparent p-0">
                <CardContent className="p-0 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base font-semibold">Judul Berita</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Masukkan judul berita yang menarik"
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Foto Utama</Label>
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                            <ImageUpload
                                name="image"
                                folder="news"
                                className="w-full"
                                previewClassName="w-full h-48 rounded-lg object-cover"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-base font-semibold">Isi Berita</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Tulis lengkap berita atau informasi..."
                            className="min-h-[200px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 resize-y"
                            required
                            defaultValue="Bandung - "
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg shadow-lg shadow-emerald-600/20"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Mengirim...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-5 w-5" />
                            Kirim Berita
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
