import { prisma } from "@/lib/prisma";
import SedekahClient from "./sedekah-client";

export const dynamic = "force-dynamic";

export default async function SedekahSubuhPage() {
    // Fetch Settings for QRIS
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    const qrisImage = settingsMap["qrisImage"];
    const bankAccount = settingsMap["bankAccount"];
    const isOfflinePaymentActive = settingsMap["payment_offline_active"] === "true";
    const isOnlineSetting = settingsMap["payment_online_active"];
    const isOnlinePaymentActive = isOnlineSetting === undefined ? true : isOnlineSetting === "true";

    // Fetch Page Configuration from Menu Item
    const menuItem = await prisma.menuItem.findFirst({
        where: { href: "/sedekah-subuh" },
    });

    // Calculate total verified donations dynamically
    let totalDonations = 0;

    if (menuItem) {
        const lastReset = menuItem.lastResetAt || new Date(0); // Default to epoch if null

        const verifiedAgg = await prisma.transaction.aggregate({
            where: {
                menuItemId: menuItem.id,
                status: "VERIFIED",
                createdAt: { gt: lastReset }
            },
            _sum: { amount: true }
        });

        totalDonations = Number(verifiedAgg._sum.amount || 0);
    }

    return <SedekahClient
        qrisImage={qrisImage}
        bankAccount={bankAccount}
        totalDonations={totalDonations}
        programId={menuItem?.id}
        isOfflinePaymentActive={isOfflinePaymentActive}
        isOnlinePaymentActive={isOnlinePaymentActive}
    />;
}
