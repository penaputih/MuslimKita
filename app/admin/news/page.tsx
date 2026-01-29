import { prisma } from "@/lib/prisma";
import NewsClient from "./news-client";

export default async function NewsPage() {
    const newsData = await prisma.news.findMany({
        orderBy: { createdAt: "desc" },
    });

    const news = newsData.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
    }));

    return <NewsClient initialData={news} />;
}
