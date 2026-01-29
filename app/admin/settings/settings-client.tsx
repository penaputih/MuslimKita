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
import { Textarea } from "@/components/ui/textarea";
import { useTransition } from "react";
import { updateSettings } from "./actions";
import { Loader2 } from "lucide-react";

// Define the shape of the settings data
export type SettingsData = {
    majlisName?: string;
    majlisAddress?: string;
    majlisPhone?: string;
    qrisImage?: string;
    bankAccount?: string;
    runningText_content?: string;
    runningText_speed?: string;
    runningText_isActive?: string;
    [key: string]: string | undefined;
};

export default function SettingsClient({ initialData }: { initialData: SettingsData }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await updateSettings(formData);
            if (res?.success) {
                alert("Pengaturan berhasil disimpan");
            } else {
                alert("Gagal menyimpan pengaturan");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
                <p className="text-muted-foreground">Konfigurasi informasi majlis.</p>
            </div>

            <div className="grid gap-6">
                {/* Informasi Majlis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Majlis</CardTitle>
                        <CardDescription>Informasi umum yang akan ditampilkan di aplikasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="majlisName">Nama Majlis / Komunitas</Label>
                            <Input id="majlisName" name="majlisName" defaultValue={initialData.majlisName || "DISA - Daarussyifa Islamic Super App"} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="majlisAddress">Alamat Lengkap</Label>
                            <Textarea id="majlisAddress" name="majlisAddress" defaultValue={initialData.majlisAddress || ""} placeholder="Jl. Raya..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="majlisPhone">Nomor Telepon / WhatsApp</Label>
                            <Input id="majlisPhone" name="majlisPhone" defaultValue={initialData.majlisPhone || ""} placeholder="+62..." />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Informasi Aplikasi */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Aplikasi</CardTitle>
                        <CardDescription>Deskripsi tentang aplikasi yang akan muncul di menu "Tentang Aplikasi".</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="app_description">Deskripsi Aplikasi</Label>
                            <Textarea
                                id="app_description"
                                name="app_description"
                                defaultValue={initialData.app_description || ""}
                                placeholder="Jelaskan tentang aplikasi ini..."
                                className="min-h-[150px]"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Kontak Layanan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kontak Layanan</CardTitle>
                        <CardDescription>Informasi kontak yang akan muncul di menu "Kontak / Hubungi Kami".</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_email">Email Support</Label>
                            <Input id="contact_email" name="contact_email" type="email" defaultValue={initialData.contact_email || ""} placeholder="admin@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_whatsapp">WhatsApp Admin</Label>
                            <Input id="contact_whatsapp" name="contact_whatsapp" defaultValue={initialData.contact_whatsapp || ""} placeholder="628123456789" />
                            <p className="text-xs text-muted-foreground">Gunakan format internasional (contoh: 628123456789) tanpa tanda + atau spasi.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_instagram">Instagram Username</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                    @
                                </span>
                                <Input id="contact_instagram" name="contact_instagram" defaultValue={initialData.contact_instagram || ""} placeholder="username" className="rounded-l-none" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Running Text Notification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Running Text Notification</CardTitle>
                        <CardDescription>Pesan berjalan di halaman utama untuk informasi penting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="runningText_isActive">Status Aktif</Label>
                                <select
                                    id="runningText_isActive"
                                    name="runningText_isActive"
                                    defaultValue={initialData.runningText_isActive || "false"}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="runningText_content">Isi Pesan</Label>
                            <Textarea
                                id="runningText_content"
                                name="runningText_content"
                                defaultValue={initialData.runningText_content || ""}
                                placeholder="Contoh: Kajian Rutin libur sementara..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="runningText_speed">Kecepatan Animasi (Detik)</Label>
                            <Input
                                id="runningText_speed"
                                name="runningText_speed"
                                type="number"
                                defaultValue={initialData.runningText_speed || "20"}
                                placeholder="20"
                            />
                            <p className="text-xs text-muted-foreground">Semakin kecil angka, semakin cepat.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}
