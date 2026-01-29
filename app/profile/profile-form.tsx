"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, KeyRound, Loader2, LogOut, Phone, User as UserIcon, Newspaper, Info, HelpCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { changePassword, logout, updateProfile } from "./actions";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun, Mail, LayoutDashboard } from "lucide-react";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    image?: string | null;
    role: string;
    isContributor?: boolean;
}

export interface AppSettings {
    description: string;
    email: string;
    instagram: string;
    whatsapp: string;
}

export function ProfileForm({ user, settings }: { user: UserProfile | null; settings: AppSettings }) {
    const [isPending, startTransition] = useTransition();
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const { setTheme, theme } = useTheme();
    const [aboutOpen, setAboutOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    // ... existing hooks ...
    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await updateProfile(formData);
            if (res.success) {
                setEditOpen(false);
                toast.success("Profil berhasil diperbarui");
            } else {
                toast.error(res.error);
            }
        });
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await changePassword(formData);
            if (res.success) {
                setPasswordOpen(false);
                toast.success("Password berhasil diubah");
            } else {
                toast.error(res.error);
            }
        });
    };

    // Guest View
    if (!user) {
        return (
            <div className="space-y-6">
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="mb-4">
                            <Avatar className="size-24 border-4 border-slate-50 dark:border-slate-800 shadow-sm">
                                <AvatarImage src="/images/avatar-default.png" className="object-cover" />
                                <AvatarFallback className="text-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                    <UserIcon className="size-10" />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Hamba Allah</h2>
                        <p className="text-muted-foreground text-sm mb-4">Silahkan masuk untuk akses penuh</p>
                    </CardContent>
                </Card>

                <div className="w-full space-y-3 px-2">
                    <Link href="/login" className="block w-full">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800">
                            <LogIn className="size-4 mr-3 text-primary" />
                            <span className="font-medium">Daftar atau Masuk</span>
                        </Button>
                    </Link>

                    <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setThemeOpen(true)}>
                        <Sun className="size-4 mr-3 text-primary" />
                        <span className="font-medium">Tampilan Aplikasi</span>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setAboutOpen(true)}>
                        <Info className="size-4 mr-3 text-primary" />
                        <span className="font-medium">Tentang Aplikasi</span>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setContactOpen(true)}>
                        <HelpCircle className="size-4 mr-3 text-primary" />
                        <span className="font-medium">Kontak / Hubungi Kami</span>
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-12 mb-4 opacity-50">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Version 1.1.0
                    </p>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <p className="text-[10px] tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                        <a href="https:ridwannur.my.id">AGATHIAS.DEV</a></p>
                </div>

                {/* Theme Dialog (Shared) */}
                <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tampilan Aplikasi</DialogTitle>
                            <DialogDescription>
                                Pilih tampilan aplikasi yang Anda inginkan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-4 py-4">
                            <button
                                onClick={() => { setTheme("light"); setThemeOpen(false); }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <Sun className="size-6 text-orange-500" />
                                </div>
                                <span className="text-sm font-medium">Terang</span>
                            </button>
                            <button
                                onClick={() => { setTheme("dark"); setThemeOpen(false); }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="p-3 bg-slate-900 rounded-full shadow-sm">
                                    <Moon className="size-6 text-slate-100" />
                                </div>
                                <span className="text-sm font-medium">Gelap</span>
                            </button>
                            <button
                                onClick={() => { setTheme("system"); setThemeOpen(false); }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="p-3 bg-slate-100 rounded-full shadow-sm">
                                    <Laptop className="size-6 text-slate-600" />
                                </div>
                                <span className="text-sm font-medium">Sistem</span>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* About App Dialog */}
                <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tentang Aplikasi</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-justify text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {settings.description || "Aplikasi ZakatKita adalah platform digital untuk memudahkan pengelolaan zakat, infaq, dan sedekah secara transparan dan amanah."}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Contact Dialog */}
                <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Kontak Kami</DialogTitle>
                            <DialogDescription>Hubungi kami melalui saluran berikut:</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {settings.email && (
                                <a href={`mailto:${settings.email}`} className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
                                        <Mail className="size-5" />
                                    </div>
                                    <span className="font-medium">{settings.email}</span>
                                </a>
                            )}
                            {settings.whatsapp && (
                                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
                                        <Phone className="size-5" />
                                    </div>
                                    <span className="font-medium">{settings.whatsapp}</span>
                                </a>
                            )}
                            {settings.instagram && (
                                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-full mr-3">
                                        <Camera className="size-5" />
                                    </div>
                                    <span className="font-medium">@{settings.instagram}</span>
                                </a>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-6 flex flex-col items-center text-center relative">
                    <div className="relative mb-4">
                        <Avatar className="size-24 border-4 border-slate-50 dark:border-slate-800 shadow-lg">
                            <AvatarImage src={user.image || "/images/avatar-default.png"} className="object-cover" />
                            <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-0 right-0 rounded-full h-8 w-8 border-2 border-white shadow-sm"
                            onClick={() => setEditOpen(true)}
                        >
                            <Camera className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
                    <p className="text-muted-foreground text-sm mb-2">{user.email}</p>
                    {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full mb-2">
                            <Phone className="size-3" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold tracking-wider uppercase">
                        {user.role === "ADMIN" ? "ADMIN" : (user.isContributor ? "CONTRIBUTOR" : user.role)}
                    </span>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {/* Admin Dashboard Button */}
                {user.role === "ADMIN" && (
                    <Link href="/admin" className="block mb-3">
                        <Button variant="outline" className="w-full justify-start h-12 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                            <LayoutDashboard className="size-4 mr-3 text-indigo-600" />
                            <span className="font-medium">Dashboard Admin</span>
                        </Button>
                    </Link>
                )}

                <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setEditOpen(true)}>
                    <UserIcon className="size-4 mr-3 text-primary" />
                    <span className="font-medium">Edit Profil</span>
                </Button>

                {/* Create News Button (For Contributors) */}
                {user.isContributor && (
                    <Link href="/berita/tulis" className="block mt-3">
                        <Button variant="outline" className="w-full justify-start h-12 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                            <Newspaper className="size-4 mr-3 text-emerald-600" />
                            <span className="font-medium">Tulis Berita</span>
                        </Button>
                    </Link>
                )}

                <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setPasswordOpen(true)}>
                    <KeyRound className="size-4 mr-3 text-primary" />
                    <span className="font-medium">Ganti Password</span>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setThemeOpen(true)}>
                    <Sun className="size-4 mr-3 text-primary" />
                    <span className="font-medium">Tampilan Aplikasi</span>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setAboutOpen(true)}>
                    <Info className="size-4 mr-3 text-primary" />
                    <span className="font-medium">Tentang Aplikasi</span>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800" onClick={() => setContactOpen(true)}>
                    <HelpCircle className="size-4 mr-3 text-primary" />
                    <span className="font-medium">Kontak / Hubungi Kami</span>
                </Button>

                <form action={logout}>
                    <Button variant="outline" className="w-full justify-start h-12 bg-white border-destructive/20 hover:bg-destructive/5 text-destructive dark:bg-slate-900 dark:border-destructive/30">
                        <LogOut className="size-4 mr-3" />
                        <span className="font-medium">Keluar Aplikasi</span>
                    </Button>
                </form>
            </div>

            <div className="flex items-center justify-center gap-3 mt-12 mb-4 opacity-50">
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Version 1.1.0
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <p className="text-[10px] tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                    <a href="https:ridwannur.my.id">AGATHIAS.DEV</a>
                </p>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Profil</DialogTitle>
                        <DialogDescription>
                            Ubah informasi profil Anda di sini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                        <div className="flex justify-center mb-4">
                            <ImageUpload
                                id="image"
                                name="image"
                                label=""
                                defaultImage={user.image}
                                folder="avatars"
                                className="w-32 h-32 rounded-full mx-auto"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" name="name" defaultValue={user.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">No. WhatsApp</Label>
                            <Input id="phone" name="phone" defaultValue={user.phone || ""} placeholder="081234567890" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ganti Password</DialogTitle>
                        <DialogDescription>
                            Masukkan password saat ini dan password baru.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Password Saat Ini</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <Input id="newPassword" name="newPassword" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Ganti Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Theme Selection Dialog */}
            <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tampilan Aplikasi</DialogTitle>
                        <DialogDescription>
                            Pilih tampilan aplikasi yang Anda inginkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4">
                        <button
                            onClick={() => { setTheme("light"); setThemeOpen(false); }}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Sun className="size-6 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium">Terang</span>
                        </button>
                        <button
                            onClick={() => { setTheme("dark"); setThemeOpen(false); }}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="p-3 bg-slate-900 rounded-full shadow-sm">
                                <Moon className="size-6 text-slate-100" />
                            </div>
                            <span className="text-sm font-medium">Gelap</span>
                        </button>
                        <button
                            onClick={() => { setTheme("system"); setThemeOpen(false); }}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="p-3 bg-slate-100 rounded-full shadow-sm">
                                <Laptop className="size-6 text-slate-600" />
                            </div>
                            <span className="text-sm font-medium">Sistem</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* About App Dialog */}
            <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tentang Aplikasi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-justify text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {settings.description || "Aplikasi ZakatKita adalah platform digital untuk memudahkan pengelolaan zakat, infaq, dan sedekah secara transparan dan amanah."}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Contact Dialog */}
            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Kontak Kami</DialogTitle>
                        <DialogDescription>Hubungi kami melalui saluran berikut:</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {settings.email && (
                            <a href={`mailto:${settings.email}`} className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
                                    <Mail className="size-5" />
                                </div>
                                <span className="font-medium">{settings.email}</span>
                            </a>
                        )}
                        {settings.whatsapp && (
                            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
                                    <Phone className="size-5" />
                                </div>
                                <span className="font-medium">{settings.whatsapp}</span>
                            </a>
                        )}
                        {settings.instagram && (
                            <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="p-2 bg-pink-100 text-pink-600 rounded-full mr-3">
                                    <Camera className="size-5" />
                                </div>
                                <span className="font-medium">@{settings.instagram}</span>
                            </a>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
