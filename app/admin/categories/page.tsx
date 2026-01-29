import { prisma } from "@/lib/prisma";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <CategoriesClient categories={categories} />;
}
