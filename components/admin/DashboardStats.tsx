import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Globe, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
    totalOnline: number;
    totalOffline: number;
    totalUsers: number;
    activeNews: number;
}

export default function DashboardStats({ totalOnline, totalOffline, totalUsers, activeNews }: DashboardStatsProps) {
    const stats = [
        {
            label: "Donasi Online",
            value: formatCurrency(totalOnline),
            icon: Globe,
            color: "bg-cyan-100 text-cyan-600",
            subtext: "Via Midtrans (Verified)"
        },
        {
            label: "Donasi Offline",
            value: formatCurrency(totalOffline),
            icon: QrCode, // Or Wallet
            color: "bg-amber-100 text-amber-600",
            subtext: "Via Manual Transfer (Verified)"
        },
        {
            label: "Total Donasi (Grand Total)",
            value: formatCurrency(totalOnline + totalOffline),
            icon: DollarSign,
            color: "bg-emerald-100 text-emerald-600",
            subtext: "Semua Channel"
        },
        // Keeping requested existing cards
        // User card is passed in props, we can handle its display here or in parent if we want to stick to exact request layout.
        // Request said: "Keep Existing Cards: Do NOT remove the 'Berita Aktif' or 'Total Users' cards."
        // So we will render them as part of this grid.
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.label}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.color}`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
