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
import { useState, useTransition } from "react";
import { createEvent, deleteEvent } from "./actions";
import { SerializableEvent } from "@/lib/definitions";
import { ImageUpload } from "@/components/ImageUpload";

export default function EventsClient({ initialData }: { initialData: SerializableEvent[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createEvent(formData);
            if (res?.success) {
                setIsOpen(false);
            } else {
                alert("Error creating event");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
            await deleteEvent(id);
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Jadwal Kajian</h2>
                    <p className="text-muted-foreground">Atur jadwal pengajian dan acara majlis.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 gap-1" suppressHydrationWarning>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Tambah Kajian
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Jadwal Kajian</DialogTitle>
                            <DialogDescription>
                                Isi detail acara kajian.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Judul</Label>
                                <Input id="title" name="title" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ustadzName" className="text-right">Pemateri</Label>
                                <Input id="ustadzName" name="ustadzName" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Tanggal</Label>
                                <Input id="date" name="date" type="date" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">Waktu</Label>
                                <Input id="time" name="time" placeholder="19:30 WIB" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">Lokasi</Label>
                                <Input id="location" name="location" defaultValue="Masjid Raya" className="col-span-3" required />
                            </div>
                            <ImageUpload id="posterImage" name="posterImage" label="Poster Kajian" folder="events" />
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
                    <CardTitle>Kajian Mendatang</CardTitle>
                    <CardDescription>
                        Jadwal kegiatan yang akan berlangsung.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Acara</TableHead>
                                <TableHead>Pemateri</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                        Belum ada jadwal.
                                    </TableCell>
                                </TableRow>
                            )}
                            {initialData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{item.ustadzName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                            <span className="text-muted-foreground">{item.time}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.location}</TableCell>
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
                                                <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
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
