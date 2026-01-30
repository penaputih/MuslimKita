import { prisma } from "@/lib/prisma";
import WakafClient from "./WakafClient";

export const dynamic = "force-dynamic";

export default async function WakafAsramaPage() {
    // 1. Fetch Page Configuration from Menu Item
    const menuItem = await prisma.menuItem.findFirst({
        where: { href: "/wakaf/asrama" },
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    });

    // 2. Fetch Settings for QRIS & Bank
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

    // 3. Defaults
    // Use values from DB or fallbacks
    const targetAmount = menuItem?.targetAmount ? Number(menuItem.targetAmount) : 2000000000;

    // Aggregation for verified transactions
    let currentAmount = 0;

    if (menuItem) {
        const lastReset = menuItem.lastResetAt || new Date(0);

        const verifiedAgg = await prisma.transaction.aggregate({
            where: {
                menuItemId: menuItem.id,
                status: "VERIFIED",
                createdAt: { gt: lastReset }
            },
            _sum: { amount: true }
        });

        currentAmount = Number(verifiedAgg._sum.amount || 0);
    }

    const pageDescription = menuItem?.pageDescription;
    const pageImage = menuItem?.pageImage;
    const pageTitle = menuItem?.pageTitle;
    const categoryLabel = menuItem?.categoryLabel;

    return (
        <WakafClient
            qrisImage={qrisImage}
            bankAccount={bankAccount}
            targetAmount={targetAmount}
            initialRaised={currentAmount}
            description={pageDescription}
            image={pageImage}
            title={pageTitle}
            category={categoryLabel}
            programId={menuItem?.id}
            isOfflinePaymentActive={isOfflinePaymentActive}
            isOnlinePaymentActive={isOnlinePaymentActive}
        />
    );
}
