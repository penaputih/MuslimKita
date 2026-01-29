"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Link as LinkIcon, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";


interface MenuItem {
    id: string;
    label: string;
    icon: string;
    href: string;
    color: string;
    order: number;
    isActive: boolean;
    type: string;
    template: string;
    slug?: string;
    pageTitle?: string;
    categoryLabel?: string;
    pageDescription?: string;
    pageImage?: string;
    targetAmount?: number;
    currentAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}

const AVAILABLE_COLORS = [
    { label: "Emerald", class: "bg-emerald-100 text-emerald-600" },
    { label: "Blue", class: "bg-blue-100 text-blue-600" },
    { label: "Rose", class: "bg-rose-100 text-rose-600" },
    { label: "Amber", class: "bg-amber-100 text-amber-600" },
    { label: "Violet", class: "bg-violet-100 text-violet-600" },
    { label: "Cyan", class: "bg-cyan-100 text-cyan-600" },
    { label: "Orange", class: "bg-orange-100 text-orange-600" },
    { label: "Gray", class: "bg-gray-100 text-gray-600" },
    { label: "Indigo", class: "bg-indigo-100 text-indigo-600" },
    { label: "Pink", class: "bg-pink-100 text-pink-600" },
];

export default function MenuClient({ initialData }: { initialData: MenuItem[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [items, setItems] = useState<MenuItem[]>(initialData);

    useEffect(() => {
        setItems(initialData);
    }, [initialData]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        label: "",
        icon: "Circle",
        href: "#",
        color: AVAILABLE_COLORS[0].class,
        order: 0,
        isActive: true,
        type: "LINK",
        template: "NONE",
        slug: "",
        pageTitle: "",
        categoryLabel: "Program Utama",
        pageDescription: "",
        pageImage: "",
        targetAmount: 0,
        currentAmount: 0,
    });

    // Icon Picker State
    const [iconSearch, setIconSearch] = useState("");

    // Update slug when pageTitle changes
    useEffect(() => {
        if (formData.type === "PAGE" && formData.pageTitle && !editingItem) {
            const slug = formData.pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug: slug, href: `/program/${slug}` }));
        }
    }, [formData.pageTitle, formData.type, editingItem]);

    const resetForm = () => {
        setFormData({
            label: "",
            icon: "Circle",
            href: "#",
            color: AVAILABLE_COLORS[0].class,
            order: items.length + 1,
            isActive: true,
            type: "LINK",
            template: "NONE",
            slug: "",
            pageTitle: "",
            categoryLabel: "Program Utama",
            pageDescription: "",
            pageImage: "",
            targetAmount: 0,
            currentAmount: 0,
        });
        setEditingItem(null);
    };

    const handleOpenDialog = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ...item,
                slug: item.slug || "",
                pageTitle: item.pageTitle || "",
                categoryLabel: item.categoryLabel || "",
                pageDescription: item.pageDescription || "",
                pageImage: item.pageImage || "",
                targetAmount: Number(item.targetAmount || 0),
                currentAmount: Number(item.currentAmount || 0),
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let result;
            if (editingItem) {
                result = await updateMenuItem(editingItem.id, formData);
            } else {
                result = await createMenuItem(formData);
            }

            if (result.error) {
                toast({ title: "Gagal", description: result.error, variant: "destructive" });
                return;
            }

            toast({ title: "Berhasil", description: editingItem ? "Menu berhasil diperbarui" : "Menu baru berhasil dibuat" });
            setIsDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast({ title: "Gagal", description: "Terjadi kesalahan sistem", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus menu ini?")) return;
        await deleteMenuItem(id);
        toast({ title: "Berhasil", description: "Menu berhasil dihapus" });
        router.refresh();
    };

    // Filter Icons
    const iconList = Object.keys(LucideIcons).filter(iconName =>
        iconName.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 50);



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manajemen Menu Home</h2>
                    <p className="text-muted-foreground">Atur tombol pintasan yang muncul di halaman depan.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 size-4" />
                    Tambah Menu
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Icon</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Link / Template</TableHead>
                            <TableHead>Warna</TableHead>
                            <TableHead className="w-[80px]">Order</TableHead>
                            <TableHead className="w-[80px]">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Belum ada menu. Silahkan tambah baru.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className={`size-8 rounded-full flex items-center justify-center ${item.color}`}>
                                                <IconComponent className="size-4" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.label}</TableCell>
                                        <TableCell>
                                            {item.type === "PAGE" ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    <FileText className="size-3 mr-1" /> Page
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    <LinkIcon className="size-3 mr-1" /> Link
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs font-mono">
                                            {item.type === "PAGE" ? (
                                                <span>{item.template} - {item.targetAmount && item.targetAmount > 0 ? "Targeted" : "No Target"}</span>
                                            ) : (
                                                item.href
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className={`w-4 h-4 rounded-full ${item.color.split(" ")[0]}`} title={item.color}></div>
                                        </TableCell>
                                        <TableCell>{item.order}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={item.isActive}
                                                onCheckedChange={async (checked) => {
                                                    await updateMenuItem(item.id, { isActive: checked });
                                                    router.refresh();
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                    <Pencil className="size-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground pb-2 border-b">Informasi Dasar</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Label Menu</Label>
                                    <Input
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        placeholder="Contoh: Wakaf Sumur"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Urutan</Label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2">
                                <Label>Warna Icon</Label>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                    {AVAILABLE_COLORS.map((c) => (
                                        <div
                                            key={c.label}
                                            className={`h-8 rounded cursor-pointer border-2 flex items-center justify-center ${c.class.split(" ")[0]} ${formData.color === c.class ? "border-black dark:border-white" : "border-transparent"}`}
                                            onClick={() => setFormData({ ...formData, color: c.class })}
                                            title={c.label}
                                        >
                                            {formData.color === c.class && <span className="text-xs font-bold text-black/50">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Icon Picker */}
                            <div className="space-y-2">
                                <Label>Pilih Icon</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari icon (ex: Heart, Box, User)..."
                                        className="pl-8"
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    {/* Social & Popular Icons */}
                                    {!iconSearch && (
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Social & Contact</Label>
                                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                                                {["Instagram", "Facebook", "Twitter", "Youtube", "Linkedin", "Globe", "MessageCircle", "Phone", "Mail", "MapPin", "Send", "Share2"].map((iconName) => {
                                                    const IconEl = (LucideIcons as any)[iconName];
                                                    if (!IconEl) return null;
                                                    return (
                                                        <div
                                                            key={iconName}
                                                            className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-muted ${formData.icon === iconName ? "bg-primary/20 border border-primary/50" : "bg-neutral-50 border border-transparent"}`}
                                                            onClick={() => setFormData({ ...formData, icon: iconName })}
                                                            title={iconName}
                                                        >
                                                            <IconEl className="size-5" />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Icons (Filtered) */}
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{iconSearch ? 'Search Results' : 'All Icons'}</Label>
                                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 h-32 overflow-y-auto border rounded-md p-2 bg-muted/20">
                                            {iconList.map((iconName) => {
                                                const IconEl = (LucideIcons as any)[iconName];
                                                return (
                                                    <div
                                                        key={iconName}
                                                        className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer hover:bg-muted ${formData.icon === iconName ? "bg-primary/20 border border-primary/50" : ""}`}
                                                        onClick={() => setFormData({ ...formData, icon: iconName })}
                                                        title={iconName}
                                                    >
                                                        <IconEl className="size-5" />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground pb-2 border-b">Tipe Menu</h3>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={formData.type === "LINK" ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, type: "LINK", template: "NONE" })}
                                    className="flex-1"
                                >
                                    <LinkIcon className="mr-2 size-4" /> Link Eksternal
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.type === "PAGE" ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, type: "PAGE", template: "WAKAF" })}
                                    className="flex-1"
                                >
                                    <FileText className="mr-2 size-4" /> Halaman Program
                                </Button>
                            </div>

                            {formData.type === "LINK" ? (
                                <div className="space-y-2">
                                    <Label>Link Tujuan (URL)</Label>
                                    <Input
                                        value={formData.href}
                                        onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                        placeholder="Contoh: /berita atau https://google.com"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Template Halaman</Label>
                                            <Select
                                                value={formData.template}
                                                onValueChange={(val) => setFormData({ ...formData, template: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WAKAF">Wakaf (Progress Bar)</SelectItem>
                                                    <SelectItem value="SEDEKAH">Sedekah (Simple)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug URL (Otomatis)</Label>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">/program/</span>
                                                <Input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Judul Halaman</Label>
                                        <Input
                                            value={formData.pageTitle}
                                            onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                                            placeholder="Judul besar di header halaman"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Label Kategori (di atas Judul)</Label>
                                        <Input
                                            value={formData.categoryLabel || ""}
                                            onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                                            placeholder="Contoh: Wakaf Produktif"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Deskripsi Singkat</Label>
                                        <div className="bg-white text-black">
                                            <Textarea
                                                value={formData.pageDescription || ""}
                                                onChange={(e) => setFormData({ ...formData, pageDescription: e.target.value })}
                                                placeholder="Deskripsi halaman..."
                                                rows={8}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Gambar Banner / Poster</Label>
                                        <ImageUpload
                                            folder="programs"
                                            value={formData.pageImage || ""}
                                            onChange={(url) => setFormData({ ...formData, pageImage: url })}
                                        />
                                    </div>

                                    {formData.template === "WAKAF" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Target Dana (Rp)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.targetAmount || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        setFormData({ ...formData, targetAmount: isNaN(val) ? 0 : val });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Terkumpul Saat Ini (Rp)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.currentAmount || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        setFormData({ ...formData, currentAmount: isNaN(val) ? 0 : val });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.label}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
