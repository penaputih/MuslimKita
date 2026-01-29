"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { updateWidgets, toggleHadithWidget, createHadith, deleteHadith } from "./actions";
import { Loader2, Trash2, PlusCircle, Quote } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";

interface Hadith {
    id: string;
    text: string;
    source: string;
}

interface WidgetData {
    qrisImage?: string;
    bankAccount?: string;
    hadithWidgetActive?: string;
    prayerWidgetActive?: string;
    dailyWisdomActive?: string;
    zakatWidgetActive?: string;
}

export default function WidgetsClient({ initialData, hadiths }: { initialData: WidgetData, hadiths: Hadith[] }) {
    const [isPending, startTransition] = useTransition();

    const handleHadithToggle = (checked: boolean) => {
        startTransition(async () => {
            await toggleHadithWidget(checked);
        });
    };

    const handlePrayerToggle = (checked: boolean) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("key", "prayerWidgetActive");
            formData.append("value", checked ? "true" : "false");
            await updateWidgets(formData); // We'll modify updateWidgets to handle generic key/value or create specific one
        });
    };

    const handleWisdomToggle = (checked: boolean) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("key", "dailyWisdomActive");
            formData.append("value", checked ? "true" : "false");
            await updateWidgets(formData);
        });
    };

    const handleZakatToggle = (checked: boolean) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("key", "zakatWidgetActive");
            formData.append("value", checked ? "true" : "false");
            await updateWidgets(formData);
        });
    };

    const handleAddHadith = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createHadith(formData);
            if (res?.success) {
                (e.target as HTMLFormElement).reset();
            } else {
                alert("Gagal menambah hadits");
            }
        });
    };

    const handleDeleteHadith = (id: string) => {
        if (!confirm("Hapus hadits ini?")) return;
        startTransition(async () => {
            await deleteHadith(id);
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await updateWidgets(formData);
            if (res?.success) {
                alert("Pengaturan widget berhasil disimpan");
            } else {
                alert("Gagal menyimpan pengaturan");
            }
        });
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Manajemen Widget</h2>
                <p className="text-muted-foreground">Konfigurasi widget pembayaran dan alat bantu lainnya.</p>
            </div>

            <div className="grid gap-6">
                {/* Pengaturan Pembayaran (QRIS) */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Widget Pembayaran (Zakat/Infaq)</CardTitle>
                            <CardDescription>Atur metode pembayaran dan gambar QRIS untuk widget kalkulator.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ImageUpload
                                id="qrisImage"
                                name="qrisImage"
                                label="Upload Gambar QRIS"
                                folder="widgets"
                                defaultImage={initialData.qrisImage || null}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="bankAccount">Nomor Rekening Bank (Opsional)</Label>
                                <Input id="bankAccount" name="bankAccount" defaultValue={initialData.bankAccount || ""} placeholder="Contoh: BSI 1234567890 a.n Yayasan..." />
                                <p className="text-[10px] text-muted-foreground">Akan ditampilkan di bawah QRIS jika diisi.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Simpan Widget
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* Pengaturan Widget Islami */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pengaturan Widget Islami</CardTitle>
                        <CardDescription>Aktifkan atau nonaktifkan fitur islami di halaman utama.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Jadwal Sholat</Label>
                                <p className="text-sm text-muted-foreground">Tampilkan hitung mundur waktu sholat</p>
                            </div>
                            <Switch
                                checked={initialData.prayerWidgetActive === "true"}
                                onCheckedChange={handlePrayerToggle}
                                disabled={isPending}
                            />
                        </div>
                        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Mutiara Hikmah (Doa)</Label>
                                <p className="text-sm text-muted-foreground">Tampilkan doa harian acak</p>
                            </div>
                            <Switch
                                checked={initialData.dailyWisdomActive === "true"}
                                onCheckedChange={handleWisdomToggle}
                                disabled={isPending}
                            />
                        </div>
                        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Kalkulator Zakat</Label>
                                <p className="text-sm text-muted-foreground">Tampilkan widget hitung zakat cepat</p>
                            </div>
                            <Switch
                                checked={initialData.zakatWidgetActive === "true"}
                                onCheckedChange={handleZakatToggle}
                                disabled={isPending}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pengaturan Hadits Widget */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Widget Hadits Pilihan</CardTitle>
                                <CardDescription>Tampilkan mutiara hadits tentang Ziswaf di halaman utama.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="hadith-active" className="text-sm font-medium">Status</Label>
                                <Switch
                                    id="hadith-active"
                                    checked={initialData.hadithWidgetActive === "true"}
                                    onCheckedChange={handleHadithToggle}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Form Tambah */}
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <PlusCircle className="size-4" /> Tambah Hadits Baru
                            </h4>
                            <form onSubmit={handleAddHadith} className="space-y-3">
                                <Textarea
                                    name="text"
                                    placeholder="Isi Hadits..."
                                    required
                                    className="min-h-[80px]"
                                />
                                <div className="flex gap-3">
                                    <Input
                                        name="source"
                                        placeholder="Riwayat (misal: HR. Bukhari)"
                                        required
                                    />
                                    <Button type="submit" size="sm" disabled={isPending}>
                                        Tambah
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* List Hadits */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Daftar Hadits ({hadiths.length})</h4>
                            {hadiths.length === 0 ? (
                                <p className="text-sm text-center py-8 text-muted-foreground italic">Belum ada data hadits.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {hadiths.map((hadith) => (
                                        <div key={hadith.id} className="group relative flex flex-col gap-2 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <Quote className="size-5 text-primary/40 shrink-0 mt-1" />
                                                <p className="text-sm flex-1 leading-relaxed">"{hadith.text}"</p>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteHadith(hadith.id)}
                                                    type="button"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs font-medium text-primary pl-8">— {hadith.source}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
