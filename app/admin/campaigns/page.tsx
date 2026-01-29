import { prisma } from "@/lib/prisma";
import CampaignsClient from "./campaigns-client";

export default async function CampaignsPage() {
    const campaignsData = await prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true }
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" }
    });

    const campaigns = campaignsData.map(c => ({
        ...c,
        targetAmount: Number(c.targetAmount),
        currentAmount: Number(c.currentAmount),
        category: c.category.name,
        categoryName: c.category.name,
        categoryId: c.categoryId
    }));

    return <CampaignsClient initialData={campaigns} categories={categories} />;
}
