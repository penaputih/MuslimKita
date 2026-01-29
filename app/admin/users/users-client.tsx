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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Shield, User as UserIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUserRole, toggleUserVerification } from "./actions";
import { Role, User } from "@prisma/client";
import { toast } from "sonner";

interface SafeUser extends Omit<User, "password" | "createdAt"> {
    password?: string;
    isVerified: boolean;
    canAccessWaris: boolean;
    isContributor: boolean;
    createdAt: string | Date;
}

export default function UsersClient({ initialData }: { initialData: SafeUser[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... existing logic
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createUser(formData);
            if (res.success) {
                setIsOpen(false);
            } else {
                alert(res.error);
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah anda yakin ingin menghapus user ini?")) return;
        startTransition(async () => {
            const res = await deleteUser(id);
            if (!res.success) alert(res.error);
        });
    };

    const handleRoleChange = async (id: string, newRole: Role) => {
        startTransition(async () => {
            const res = await updateUserRole(id, newRole);
            if (!res.success) alert(res.error);
        });
    };

    const handleVerification = async (id: string, isVerified: boolean) => {
        startTransition(async () => {
            const res = await toggleUserVerification(id, isVerified);
            if (!res.success) alert(res.error);
        });
    };

    const handleWarisAccess = async (id: string, canAccess: boolean) => {
        startTransition(async () => {
            const { toggleUserWarisAccess } = await import("./actions");
            const res = await toggleUserWarisAccess(id, canAccess);
            if (!res.success) alert(res.error);
        });
    };

    const handleContributor = async (id: string, isContributor: boolean) => {
        startTransition(async () => {
            const { toggleUserContributor } = await import("./actions");
            const res = await toggleUserContributor(id, isContributor);
            if (!res.success) alert(res.error);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
                    <p className="text-muted-foreground">Kelola pengguna dan hak akses admin.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Tambah User
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Tambah User Baru</DialogTitle>
                            <DialogDescription>
                                Buat akun baru untuk admin atau anggota majlis.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nama</Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input id="password" name="password" type="password" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select name="role" defaultValue="MEMBER" required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <CardDescription>
                        Total {initialData.length} pengguna terdaftar di sistem.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Akses Waris</TableHead>
                                <TableHead>Contributor</TableHead>
                                <TableHead>Terdaftar</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="gap-1">
                                            {user.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isVerified ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground gap-1 border-dashed">
                                                <XCircle className="h-3 w-3" /> Unverified
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.canAccessWaris ? (
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Granted
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground gap-1 border-dashed">
                                                <XCircle className="h-3 w-3" /> Denied
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.isContributor ? (
                                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none shadow-none gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Yes
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground gap-1 border-dashed">
                                                <XCircle className="h-3 w-3" /> No
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell suppressHydrationWarning>
                                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Ubah Role
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as Role)}>
                                                            <DropdownMenuRadioItem value="MEMBER">Member</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="ADMIN">Admin</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                {user.isVerified ? (
                                                    <DropdownMenuItem onClick={() => handleVerification(user.id, false)}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Batalkan Verifikasi
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleVerification(user.id, true)}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Verifikasi User
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {user.canAccessWaris ? (
                                                    <DropdownMenuItem onClick={() => handleWarisAccess(user.id, false)}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Cabut Akses Waris
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleWarisAccess(user.id, true)}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Beri Akses Waris
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {user.isContributor ? (
                                                    <DropdownMenuItem onClick={() => handleContributor(user.id, false)}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Hapus Contributor
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleContributor(user.id, true)}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Jadikan Contributor
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus User
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
