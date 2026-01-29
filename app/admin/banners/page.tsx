import { prisma } from "@/lib/prisma";
import BannersClient from "./banners-client";

export default async function BannersPage() {
    const banners = await prisma.banner.findMany({
        orderBy: { createdAt: "desc" },
    });

    return <BannersClient initialData={banners} />;
}
