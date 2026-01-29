import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
    const menuItems = await prisma.menuItem.findMany({
        orderBy: {
            order: "asc",
        },
    });

    const formattedItems = menuItems.map(item => ({
        ...item,
        slug: item.slug ?? undefined,
        pageTitle: item.pageTitle ?? undefined,
        categoryLabel: item.categoryLabel ?? undefined,
        pageDescription: item.pageDescription ?? undefined,
        pageImage: item.pageImage ?? undefined,
        targetAmount: item.targetAmount ? Number(item.targetAmount) : 0,
        currentAmount: item.currentAmount ? Number(item.currentAmount) : 0,
    }));

    return <MenuClient initialData={formattedItems} />;
}
