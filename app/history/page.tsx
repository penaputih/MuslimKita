import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Calendar, CheckCircle, Clock, ArrowLeft, LogIn } from "lucide-react";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HistoryPage() {
    const session = await getSession();

    if (!session?.user) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full mr-2">
                            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-white" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 dark:text-white">Riwayat Donasi</h1>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
                    {/* Clean Icon approach */}
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-lg border-2 border-amber-600/50 flex items-center justify-center">
                            <LogIn className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-xs">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            Login Diperlukan
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Fitur Riwayat hanya dapat diakses oleh pengguna yang telah terdaftar dan login. Silahkan login terlebih dahulu.
                        </p>
                    </div>

                    <Link href="/login">
                        <Button
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 font-medium text-base shadow-lg shadow-emerald-900/20"
                        >
                            Login Sekarang
                        </Button>
                    </Link>
                </div>
                <FloatingBottomNav />
            </div>
        );
    }

    const transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            <Header title="Riwayat Donasi" showBack backUrl="/" />

            <div className="px-4 mt-4 space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Belum ada riwayat transaksi.</p>
                    </div>
                ) : (
                    transactions.map((trx) => (
                        <Card key={trx.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg text-primary">
                                            {formatCurrency(Number(trx.amount))}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${trx.status === "VERIFIED"
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-yellow-100 text-yellow-600"
                                            }`}>
                                            {trx.status === "VERIFIED" ? "Berhasil" : "Pending"}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                </div>
                                {trx.status === "VERIFIED" && <CheckCircle className="size-5 text-emerald-500 opacity-20" />}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <FloatingBottomNav />
        </div>
    );
}
