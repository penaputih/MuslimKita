import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const programId = params.id;

        // 1. Fetch Global Settings & Program Info
        const [settings, menuItem, statsConfigs] = await Promise.all([
            prisma.settings.findMany(),
            prisma.menuItem.findUnique({
                where: { id: programId },
                select: {
                    id: true,
                    targetAmount: true,
                    categoryLabel: true,
                    // Use slug for mapping to StatsConfig if needed, or categoryLabel
                    slug: true
                }
            }),
            prisma.statsConfig.findMany() // Fetch all configs to find matches
        ]);

        if (!menuItem) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Map settings
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const isOnlineActive = settingsMap["payment_online_active"] !== "false"; // Default true
        const isOfflineActive = settingsMap["payment_offline_active"] === "true"; // Default false

        // Determine Mode
        let mode = "ONLINE";
        if (isOnlineActive && isOfflineActive) mode = "HYBRID";
        else if (!isOnlineActive && isOfflineActive) mode = "OFFLINE";
        else if (isOnlineActive && !isOfflineActive) mode = "ONLINE";
        else mode = "MAINTENANCE";

        // 2. Identify Stats Config Keys
        // We need to match the program to a key in StatsConfig (ZAKAT, WAKAF, etc.)
        // This mapping might need to be smarter, but for now we look for keywords in categoryLabel or slug
        // Or we just fetch ALL stats for the menuItemId and filter by timestamp manually?
        // Actually, StatsConfig keys are like "ZAKAT_ONLINE".
        // We need to know which CATEGORY this program belongs to.
        // Let's assume the categoryLabel or a derived key. 
        // For "Wakaf Asrama", likely key is "WAKAF".
        // Users can set reset times for categories.

        let categoryKey = "GENERAL";
        const label = menuItem.categoryLabel?.toUpperCase() || "";
        if (label.includes("WAKAF")) categoryKey = "WAKAF";
        else if (label.includes("ZAKAT")) categoryKey = "ZAKAT";
        else if (label.includes("INFAQ") || label.includes("SEDEKAH")) categoryKey = "SEDEKAH";
        else if (label.includes("PROGRAM")) categoryKey = "PROGRAM";

        // Get Reset Times
        const resetOnline = statsConfigs.find(c => c.key === `${categoryKey}_ONLINE`)?.resetAt || new Date(0);
        const resetOffline = statsConfigs.find(c => c.key === `${categoryKey}_OFFLINE`)?.resetAt || new Date(0);

        // 3. Aggregate Transactions
        // We will fetch verified transactions for this menuItem
        // And sum them up based on the active mode logic

        let collected = 0;

        if (mode === "HYBRID") {
            // Sum Online > ResetOnline + Sum Offline > ResetOffline
            const [onlineAgg, offlineAgg] = await Promise.all([
                prisma.transaction.aggregate({
                    where: {
                        menuItemId: programId,
                        status: "VERIFIED",
                        paymentType: { not: "OFFLINE" },
                        createdAt: { gt: resetOnline }
                    },
                    _sum: { amount: true }
                }),
                prisma.transaction.aggregate({
                    where: {
                        menuItemId: programId,
                        status: "VERIFIED",
                        paymentType: "OFFLINE",
                        createdAt: { gt: resetOffline }
                    },
                    _sum: { amount: true }
                })
            ]);
            collected = Number(onlineAgg._sum.amount || 0) + Number(offlineAgg._sum.amount || 0);

        } else if (mode === "ONLINE") {
            const agg = await prisma.transaction.aggregate({
                where: {
                    menuItemId: programId,
                    status: "VERIFIED",
                    paymentType: { not: "OFFLINE" },
                    createdAt: { gt: resetOnline }
                },
                _sum: { amount: true }
            });
            collected = Number(agg._sum.amount || 0);

        } else if (mode === "OFFLINE") {
            const agg = await prisma.transaction.aggregate({
                where: {
                    menuItemId: programId,
                    status: "VERIFIED",
                    paymentType: "OFFLINE",
                    createdAt: { gt: resetOffline }
                },
                _sum: { amount: true }
            });
            collected = Number(agg._sum.amount || 0);
        }

        return NextResponse.json({
            collected,
            target: Number(menuItem.targetAmount || 0),
            mode,
            isOnlineActive,
            isOfflineActive,
            categoryKey // Debug info
        });

    } catch (error: any) {
        console.error("STATS API ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
