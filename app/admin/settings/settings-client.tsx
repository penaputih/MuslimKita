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

                {/* Pembayaran & Donasi */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pembayaran & Donasi</CardTitle>
                        <CardDescription>Konfigurasi metode pembayaran dan informasi rekening.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="payment_online_active">Pembayaran Online (Midtrans)</Label>
                                <select
                                    id="payment_online_active"
                                    name="payment_online_active"
                                    defaultValue={initialData.payment_online_active || "true"}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground">Otomatisasi pembayaran via QRIS, E-Wallet, VA.</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="payment_offline_active">Pembayaran Offline / Manual</Label>
                                <select
                                    id="payment_offline_active"
                                    name="payment_offline_active"
                                    defaultValue={initialData.payment_offline_active || "false"}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                                <p className="text-[10px] text-muted-foreground">Transfer manual ke rekening atau QRIS statis.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qrisImage">Gambar QRIS (Statis)</Label>
                            {initialData.qrisImage && (
                                <div className="mb-2">
                                    <img src={initialData.qrisImage} alt="QRIS Preview" className="h-32 object-contain border rounded-md p-2" />
                                </div>
                            )}
                            <Input
                                id="qris_file"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        formData.append("folder", "settings");

                                        const loadingToast = document.createElement("div"); // Placeholder for toast logic if needed
                                        // Simple alert for now as specific toast lib might vary

                                        try {
                                            const res = await fetch("/api/upload", {
                                                method: "POST",
                                                body: formData
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                // Create a hidden input to hold the value
                                                const input = document.getElementById("qrisImage") as HTMLInputElement;
                                                if (input) input.value = data.url;
                                                alert("Gambar berhasil diupload! Klik Simpan Perubahan.");
                                            } else {
                                                alert("Gagal upload gambar.");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Terjadi kesalahan saat upload.");
                                        }
                                    }
                                }}
                            />
                            <Input id="qrisImage" name="qrisImage" defaultValue={initialData.qrisImage || ""} placeholder="URL Gambar..." className="hidden" />
                            <p className="text-xs text-muted-foreground">Upload gambar QR Code dari galeri.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bankAccount">Informasi Rekening Bank</Label>
                            <Textarea id="bankAccount" name="bankAccount" defaultValue={initialData.bankAccount || ""} placeholder="Bank BSI 1234567890 a.n Yayasan..." rows={4} />
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
