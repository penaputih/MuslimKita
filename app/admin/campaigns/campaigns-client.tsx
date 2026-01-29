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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useTransition, useMemo } from "react";
import { createCampaign, deleteCampaign, updateCampaign } from "./actions";
import { SerializableCampaign } from "@/lib/definitions";
import { ImageUpload } from "@/components/ImageUpload";

interface ExtendedCampaign extends SerializableCampaign {
    categoryName?: string;
}

import { Textarea } from "@/components/ui/textarea";

// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CampaignsClient({ initialData, categories }: { initialData: ExtendedCampaign[], categories: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [editingCampaign, setEditingCampaign] = useState<ExtendedCampaign | null>(null);
    const [description, setDescription] = useState("");

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setEditingCampaign(null); // Reset when closing
            setDescription("");
        }
    };

    const handleEdit = (campaign: ExtendedCampaign) => {
        setEditingCampaign(campaign);
        setDescription(campaign.description || "");
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            let res;
            if (editingCampaign) {
                res = await updateCampaign(editingCampaign.id, formData);
            } else {
                res = await createCampaign(formData);
            }

            if (res?.success) {
                setIsOpen(false);
                setEditingCampaign(null);
            } else {
                alert("Error saving campaign");
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
            await deleteCampaign(id);
        });
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    // const modules = useMemo(() => ({
    //     toolbar: [
    //         [{ 'header': [1, 2, false] }],
    //         ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    //         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    //         ['link', 'clean']
    //     ],
    //     clipboard: {
    //         matchVisual: false,
    //         matchers: [
    //             [1, (node: any, delta: any) => {
    //                 const ops: any[] = [];
    //                 delta.ops.forEach((op: any) => {
    //                     if (op.insert && typeof op.insert === 'string') {
    //                         ops.push({ insert: op.insert });
    //                     }
    //                 });
    //                 delta.ops = ops;
    //                 return delta;
    //             }]
    //         ]
    //     }
    // }), []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Program Donasi</h2>
                    <p className="text-muted-foreground">Kelola program wakaf, infaq, dan donasi lainnya.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 gap-1" suppressHydrationWarning>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Buat Program
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingCampaign ? "Edit Program" : "Buat Program Baru"}</DialogTitle>
                            <DialogDescription>
                                {editingCampaign ? "Ubah detail program donasi." : "Galang dana untuk kegiatan majlis."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Judul</Label>
                                <Input id="title" name="title" defaultValue={editingCampaign?.title} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="targetAmount" className="text-right">Target (Rp)</Label>
                                <Input id="targetAmount" name="targetAmount" type="number" defaultValue={editingCampaign ? Number(editingCampaign.targetAmount) : undefined} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="categoryId" className="text-right">Kategori</Label>
                                <Select name="categoryId" defaultValue={editingCampaign?.categoryId} required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <div className="bg-white text-black">
                                    <Textarea
                                        name="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Deskripsi program..."
                                        rows={8}
                                    />
                                </div>
                                {/* <input type="hidden" name="description" value={description} /> */}
                            </div>

                            <ImageUpload id="bannerImage" name="bannerImage" label="Banner Program" required={!editingCampaign} defaultImage={editingCampaign?.bannerImage || null} folder="campaigns" />
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    {editingCampaign ? "Update" : "Simpan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Program</CardTitle>
                    <CardDescription>
                        Program donasi yang sedang berjalan maupun selesai.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Program</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Terkumpul</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                                        Belum ada program.
                                    </TableCell>
                                </TableRow>
                            )}
                            {initialData.map((item) => {
                                const progress = (Number(item.currentAmount) / Number(item.targetAmount)) * 100;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell><Badge variant="outline">{item.categoryName || "Uncategorized"}</Badge></TableCell>
                                        <TableCell>{formatCurrency(Number(item.currentAmount))}</TableCell>
                                        <TableCell>{formatCurrency(Number(item.targetAmount))}</TableCell>
                                        <TableCell className="w-[150px]">
                                            <div className="flex items-center gap-2">
                                                <Progress value={progress} className="h-2 w-full" />
                                                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Active</Badge>
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(item)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
