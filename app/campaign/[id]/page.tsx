
import { prisma } from "@/lib/prisma";
import CampaignDetailClient from "./campaign-detail-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
    const { id } = await params;

    // Fetch Campaign
    const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
            category: true,
            _count: {
                select: { transactions: true }
            }
        }
    });

    if (!campaign) {
        notFound();
    }

    // Fetch Settings for QRIS & Bank
    const settings = await prisma.settings.findMany();
    const qrisImage = settings.find((s) => s.key === "qrisImage")?.value;
    const bankAccount = settings.find((s) => s.key === "bankAccount")?.value;

    // Serialize Decimal to Number for Client Component
    const serializedCampaign = {
        ...campaign,
        targetAmount: Number(campaign.targetAmount),
        currentAmount: Number(campaign.currentAmount),
        category: campaign.category,
        transactionCount: campaign._count.transactions
    };

    return (
        <CampaignDetailClient
            campaign={serializedCampaign}
            qrisImage={qrisImage}
            bankAccount={bankAccount}
            totalDonors={campaign._count.transactions}
        />
    );
}
