import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Fetch Total Online (Not OFFLINE, Verified)
        const onlineAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                status: "VERIFIED",
                paymentType: { not: "OFFLINE" }
            }
        });

        // 2. Fetch Total Offline (OFFLINE, Verified)
        const offlineAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                status: "VERIFIED",
                paymentType: "OFFLINE"
            }
        });

        // 3. Get Payment Mode
        // We check settings to see if ONLY one mode is active.
        // If both true or both false or mixed, we default to showing everything, 
        // but the specific 'paymentMode' logic requested for client might need derived state.
        const settings = await prisma.settings.findMany();
        const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const isOnline = settingsMap["payment_online_active"] !== "false"; // Default true
        const isOffline = settingsMap["payment_offline_active"] === "true"; // Default false

        let paymentMode = "HYBRID";
        if (isOnline && !isOffline) paymentMode = "ONLINE";
        if (!isOnline && isOffline) paymentMode = "OFFLINE";

        return NextResponse.json({
            totalOnline: Number(onlineAgg._sum.amount || 0),
            totalOffline: Number(offlineAgg._sum.amount || 0),
            paymentMode
        });

    } catch (error) {
        console.error("[API_STATS_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
