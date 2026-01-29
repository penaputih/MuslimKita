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
    const qrisImage = settings.find((s) => s.key === "qrisImage")?.value;
    const bankAccount = settings.find((s) => s.key === "bankAccount")?.value;

    // 3. Defaults
    // Use values from DB or fallbacks
    const targetAmount = menuItem?.targetAmount ? Number(menuItem.targetAmount) : 2000000000;
    const currentAmount = menuItem?.currentAmount ? Number(menuItem.currentAmount) : 0;
    const totalDonors = menuItem?._count.transactions || 0;

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
            totalDonors={totalDonors}
            programId={menuItem?.id}
        />
    );
}
