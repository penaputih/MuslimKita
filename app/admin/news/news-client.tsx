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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { createNews, deleteNews, updateNews } from "./actions";
import { SerializableNews } from "@/lib/definitions";
import { ImageUpload } from "@/components/ImageUpload";

export default function NewsClient({ initialData }: { initialData: SerializableNews[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [editingNews, setEditingNews] = useState<SerializableNews | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            let res;
            if (editingNews) {
                res = await updateNews(editingNews.id, formData);
            } else {
                res = await createNews(formData);
            }

            if (res?.success) {
                setIsOpen(false);
                setEditingNews(null); // Reset editing state
            } else {
                alert("Error saving news");
            }
        });
    };

    const handleEdit = (news: SerializableNews) => {
        setEditingNews(news);
        setIsOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) setEditingNews(null); // Reset on close
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
            await deleteNews(id);
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Berita & Update</h2>
                    <p className="text-muted-foreground">Kelola artikel dan pengumuman untuk jamaah.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 gap-1" suppressHydrationWarning>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Tambah Berita
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingNews ? "Edit Berita" : "Tambah Berita Baru"}</DialogTitle>
                            <DialogDescription>
                                {editingNews ? "Perbarui informasi berita." : "Tulis informasi terbaru untuk jamaah majlis."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Judul</Label>
                                <Input id="title" name="title" defaultValue={editingNews?.title} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="author" className="text-right">Penulis</Label>
                                <Input id="author" name="author" defaultValue={editingNews?.author || "Admin"} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">Konten</Label>
                                <Textarea id="content" name="content" defaultValue={editingNews?.content} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="isFeatured" className="text-right">Unggulan</Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isFeatured"
                                        name="isFeatured"
                                        value="true"
                                        defaultChecked={editingNews?.isFeatured}
                                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm text-muted-foreground">Tampilkan di Halaman Utama</label>
                                </div>
                            </div>
                            <ImageUpload id="image" name="image" label="Gambar Cover" defaultImage={editingNews?.image || null} folder="news" />
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Berita</CardTitle>
                    <CardDescription>
                        Semua berita yang telah diterbitkan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead>Penulis</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                        Belum ada berita.
                                    </TableCell>
                                </TableRow>
                            )}
                            {initialData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {item.isFeatured && <span className="text-yellow-500">★</span>}
                                            {item.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.author}</TableCell>
                                    <TableCell>{new Date(item.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell>Published</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    suppressHydrationWarning
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
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
