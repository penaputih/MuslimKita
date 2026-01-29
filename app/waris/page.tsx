import { Header } from "@/components/Header";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { WarisCalculator } from "@/components/WarisCalculator";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WarisPage() {
    const session = await getSession();

    let canAccess = false;
    let isLogin = false;

    if (session?.user?.email) {
        isLogin = true;
        // Fetch fresh user data to verify access
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role === "ADMIN" || (user as any)?.canAccessWaris) {
            canAccess = true;
        }
    }

    if (!isLogin) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full mr-2">
                            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-white" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 dark:text-white">Kalkulator Waris Islam</h1>
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
                            Fitur Kalkulator Waris hanya dapat diakses oleh pengguna yang telah terdaftar dan login. Silahkan login terlebih dahulu.
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

    if (!canAccess) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
                <div className="print:hidden">
                    <Header
                        title="Kalkulator Waris Islam"
                        showBack
                        backUrl="/"
                        user={session?.user}
                    />
                </div>

                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 text-red-600 dark:text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Akses Dibatasi</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Maaf, akun Anda belum memiliki izin untuk mengakses fitur Kalkulator Waris. Silahkan hubungi Admin untuk meminta akses.
                    </p>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                </div>

                <div className="print:hidden">
                    <FloatingBottomNav />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            <div className="print:hidden">
                <Header
                    title="Kalkulator Waris Islam"
                    showBack
                    backUrl="/"
                    user={session?.user}
                />
            </div>

            <div className="px-4 py-6 max-w-4xl mx-auto">
                <div className="mb-6 print:hidden">
                    <h2 className="text-xl font-bold mb-2">Hitung Pembagian Waris</h2>
                    <p className="text-muted-foreground text-sm">
                        Alat bantu hitung pembagian harta warisan berdasarkan Syariat Islam (Mazhab Syafi&apos;i).
                    </p>
                </div>

                <WarisCalculator />
            </div>

            <div className="print:hidden">
                <FloatingBottomNav />
            </div>
        </main>
    );
}
