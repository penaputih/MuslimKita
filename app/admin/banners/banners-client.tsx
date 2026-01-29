"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { createBanner, deleteBanner, toggleBannerStatus, updateBanner } from "./actions";
import { ImageUpload } from "@/components/ImageUpload";
import { Switch } from "@/components/ui/switch";

// Define the type here since we might not have it generated yet in client
type Banner = {
    id: string;
    title: string;
    subtitle: string | null;
    image: string;
    ctaText: string | null;
    ctaLink: string | null;
    isActive: boolean;
    createdAt: Date;
};

export default function BannersClient({ initialData }: { initialData: Banner[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) setEditingBanner(null);
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            let res;
            if (editingBanner) {
                res = await updateBanner(editingBanner.id, formData);
            } else {
                res = await createBanner(formData);
            }

            if (res?.success) {
                setIsOpen(false);
                setEditingBanner(null);
            } else {
                alert(res?.error || "Error saving banner");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus banner ini?")) return;
        startTransition(async () => {
            await deleteBanner(id);
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            await toggleBannerStatus(id, !currentStatus);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Banner Widget</h2>
                    <p className="text-muted-foreground">Kelola slide banner yang tampil di halaman utama.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 gap-1" suppressHydrationWarning>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Tambah Banner
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingBanner ? "Edit Banner" : "Tambah Banner Baru"}</DialogTitle>
                            <DialogDescription>
                                Gunakan gambar landscape kualitas tinggi untuk hasil terbaik.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Judul</Label>
                                <Input id="title" name="title" defaultValue={editingBanner?.title} className="col-span-3" required placeholder="Contoh: Kajian Rutin" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="subtitle" className="text-right">Subjudul</Label>
                                <Input id="subtitle" name="subtitle" defaultValue={editingBanner?.subtitle || ""} className="col-span-3" placeholder="Deskripsi singkat" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ctaText" className="text-right">Teks Tombol</Label>
                                <Input id="ctaText" name="ctaText" defaultValue={editingBanner?.ctaText || ""} className="col-span-3" placeholder="Contoh: Lihat Detail" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ctaLink" className="text-right">Link Tombol</Label>
                                <Input id="ctaLink" name="ctaLink" defaultValue={editingBanner?.ctaLink || ""} className="col-span-3" placeholder="/campaigns/..." />
                            </div>

                            <ImageUpload
                                id="image"
                                name="image"
                                label="Gambar Background"
                                required={!editingBanner}
                                defaultImage={editingBanner?.image || null}
                                folder="banners"
                            />

                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    {editingBanner ? "Update" : "Simpan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Banner</CardTitle>
                    <CardDescription>
                        Geser status untuk mengaktifkan atau menonaktifkan banner.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Preview</TableHead>
                                <TableHead>Konten</TableHead>
                                <TableHead>Tombol</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                        Belum ada banner.
                                    </TableCell>
                                </TableRow>
                            )}
                            {initialData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="w-16 h-10 rounded bg-slate-100 overflow-hidden relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.subtitle}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {item.ctaText} &rarr; {item.ctaLink}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={item.isActive}
                                                onCheckedChange={() => handleToggleStatus(item.id, item.isActive)}
                                                disabled={isPending}
                                            />
                                            <span className="text-xs text-muted-foreground">{item.isActive ? "Aktif" : "Nonaktif"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" suppressHydrationWarning>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
