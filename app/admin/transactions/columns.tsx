"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { verifyTransaction } from "./actions";
import { toast } from "sonner";
import { useState } from "react";

// Define the shape of our data
export type Transaction = {
    id: string;
    amount: any; // Decimal
    status: "PENDING" | "VERIFIED";
    paymentType: string | null;
    proofImage: string;
    createdAt: Date;
    user?: {
        name: string;
        email: string;
    } | null;
    menuItem?: {
        label: string;
    } | null;
    campaign?: {
        title: string;
    } | null;
    customerDetails?: any;
};

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tanggal
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        },
    },
    {
        accessorKey: "user",
        header: "Donatur",
        cell: ({ row }) => {
            const user = row.original.user;
            const customerDetails = row.original.customerDetails as any;
            const name = user?.name || customerDetails?.first_name || "Hamba Allah";
            const email = user?.email || customerDetails?.email || "-";
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">{email}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }).format(amount);

            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "menuItem",
        header: "Program",
        cell: ({ row }) => {
            const label = row.original.menuItem?.label || row.original.campaign?.title || "-";
            return <Badge variant="outline">{label}</Badge>;
        },
    },
    {
        accessorKey: "paymentType",
        header: "Metode",
        cell: ({ row }) => {
            return <Badge variant="secondary">{row.getValue("paymentType") || "ONLINE"}</Badge>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "VERIFIED" ? "default" : "destructive"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isLoading, setIsLoading] = useState(false);

            const handleVerify = async () => {
                setIsLoading(true);
                const result = await verifyTransaction(transaction.id);
                setIsLoading(false);
                if (result.success) {
                    toast.success("Transaksi berhasil diverifikasi");
                } else {
                    toast.error(result.error);
                }
            };

            return (
                <div className="flex items-center gap-2">
                    {transaction.proofImage && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogTitle>Bukti Transfer</DialogTitle>
                                <img src={transaction.proofImage} alt="Bukti Transfer" className="w-full h-auto rounded-lg" />
                            </DialogContent>
                        </Dialog>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                                Copy Tiket ID
                            </DropdownMenuItem>
                            {transaction.status === "PENDING" && (
                                <DropdownMenuItem onClick={handleVerify} disabled={isLoading}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Verifikasi Pembayaran
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
