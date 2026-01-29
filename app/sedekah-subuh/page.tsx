import { prisma } from "@/lib/prisma";
import SedekahClient from "./sedekah-client";

export const dynamic = "force-dynamic";

export default async function SedekahSubuhPage() {
    // Fetch Settings for QRIS
    const settings = await prisma.settings.findMany();
    const qrisImage = settings.find((s) => s.key === "qrisImage")?.value;
    const bankAccount = settings.find((s) => s.key === "bankAccount")?.value;

    // Fetch Page Configuration from Menu Item
    const menuItem = await prisma.menuItem.findFirst({
        where: { href: "/sedekah-subuh" },
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    });

    const totalDonations = menuItem?.currentAmount ? Number(menuItem.currentAmount) : 0;
    const totalDonors = menuItem?._count.transactions || 0;

    return <SedekahClient
        qrisImage={qrisImage}
        bankAccount={bankAccount}
        totalDonations={totalDonations}
        totalDonors={totalDonors}
        programId={menuItem?.id}
    />;
}
