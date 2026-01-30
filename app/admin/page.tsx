import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Newspaper, Calendar, RefreshCw, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { resetStats } from "./actions";
import { Button } from "@/components/ui/button";
import { GenericResetButton } from "@/components/admin/GenericResetButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    // 1. Fetch Stats Config for Resets
    const statsConfig = await prisma.statsConfig.findMany();
    const resets = statsConfig.reduce((acc: Record<string, Date>, curr: any) => {
        acc[curr.key] = curr.resetAt;
        return acc;
    }, {} as Record<string, Date>);

    const getResetTime = (key: string) => resets[key] || new Date(0); // Default to epoch

    // 2. Fetch Aggregated Stats
    // Helper function for aggregation
    const getAggregatedAmount = async (
        category: "ZAKAT" | "WAKAF" | "SEDEKAH" | "PROGRAM",
        type: "ONLINE" | "OFFLINE",
        resetTime: Date
    ) => {
        const whereClause: any = {
            status: "VERIFIED",
            createdAt: { gt: resetTime }
        };

        if (type === "ONLINE") {
            whereClause.paymentType = { not: "OFFLINE" };
        } else {
            whereClause.paymentType = "OFFLINE";
        }

        if (category === "PROGRAM") {
            whereClause.campaignId = { not: null };
        } else if (category === "WAKAF") {
            whereClause.menuItem = { href: "/wakaf/asrama" };
        } else if (category === "ZAKAT") {
            whereClause.menuItem = { href: "/zakat" };
        } else if (category === "SEDEKAH") {
            whereClause.menuItem = { href: "/sedekah-subuh" };
        }

        const result = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: whereClause
        });

        return Number(result._sum.amount || 0);
    };

    // Categories
    const categories = ["PROGRAM", "WAKAF", "ZAKAT", "SEDEKAH"] as const;
    const labels = {
        PROGRAM: "Program Donasi",
        WAKAF: "Wakaf Asrama",
        ZAKAT: "Zakat",
        SEDEKAH: "Sedekah Subuh"
    };

    // Parallel Fetching
    const [
        totalUsers,
        activeNews,
        ...statsResults
    ] = await Promise.all([
        prisma.user.count(),
        prisma.news.count(),
        // Online Stats
        ...categories.map(cat => getAggregatedAmount(cat, "ONLINE", getResetTime(`${cat}_ONLINE`))),
        // Offline Stats
        ...categories.map(cat => getAggregatedAmount(cat, "OFFLINE", getResetTime(`${cat}_OFFLINE`)))
    ]);

    // Map results back to structure
    const onlineStats = categories.map((cat, idx) => ({
        key: cat,
        label: labels[cat],
        value: statsResults[idx],
        color: "bg-cyan-50 text-cyan-600 border-cyan-100"
    }));

    const offlineStats = categories.map((cat, idx) => ({
        key: cat,
        label: labels[cat],
        value: statsResults[idx + categories.length],
        color: "bg-orange-50 text-orange-600 border-orange-100"
    }));

    // Recent Transactions (Limit 5)
    const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "VERIFIED" },
        include: {
            user: true,
            menuItem: true,
            campaign: true
        }
    });

    return (
        <div className="space-y-8 pb-10">
            {/* Section 1: Pemasukan Online */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                        <DollarSign className="size-5" />
                    </div>
                    Pemasukan Online (Midtrans)
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {onlineStats.map((stat) => (
                        <Card key={stat.key} className={`shadow-sm border-l-4 ${stat.color.replace('bg-', 'border-l-')}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <GenericResetButton
                                    category={`${stat.label} (Online)`}
                                    onReset={resetStats.bind(null, stat.key, "ONLINE")}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-800">
                                    {formatCurrency(stat.value)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    via Payment Gateway
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 2: Pemasukan Offline */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Layers className="size-5" />
                    </div>
                    Pemasukan Offline (Manual / QRIS)
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {offlineStats.map((stat) => (
                        <Card key={stat.key} className={`shadow-sm border-l-4 ${stat.color.replace('bg-', 'border-l-')}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <GenericResetButton
                                    category={`${stat.label} (Offline)`}
                                    onReset={resetStats.bind(null, stat.key, "OFFLINE")}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-800">
                                    {formatCurrency(stat.value)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    via Manual / Transfer
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 3: Statistik Umum & Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <Users className="size-5" />
                        </div>
                        Statistik Umum
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="shadow-sm border-l-4 border-indigo-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers.toLocaleString("id-ID")}</div>
                                <p className="text-xs text-muted-foreground mt-1">Terdaftar di aplikasi</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-pink-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Berita Aktif</CardTitle>
                                <Newspaper className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeNews}</div>
                                <p className="text-xs text-muted-foreground mt-1">Artikel dipublikasikan</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm mt-6">
                        <CardHeader>
                            <CardTitle>Overview Donasi</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                                Chart Placeholder (No Data)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Calendar className="size-5" />
                        </div>
                        Aktivitas Terbaru
                    </h2>
                    <Card className="border-none shadow-sm h-fit">
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {recentTransactions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi.</p>
                                ) : (
                                    recentTransactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center gap-4 group">
                                            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
                                                {tx.user?.name ? tx.user.name.substring(0, 2).toUpperCase() : "HA"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-slate-800">{tx.user?.name || "Hamba Allah"}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {tx.campaign?.title || tx.menuItem?.label || "Donasi"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">{formatCurrency(Number(tx.amount))}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
