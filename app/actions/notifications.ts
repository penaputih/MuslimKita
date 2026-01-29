"use server";

import { prisma } from "@/lib/prisma";

export interface NotificationItem {
    id: string;
    title: string;
    excerpt: string;
    createdAt: Date;
    url: string;
    type: "NEWS" | "CAMPAIGN" | "PROGRAM";
    image?: string | null;
}

export async function getRecentNotifications(): Promise<NotificationItem[]> {
    try {
        // 1. Fetch Latest News
        const news = await prisma.news.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                image: true
            }
        });

        // 2. Fetch Latest Campaigns
        const campaigns = await prisma.campaign.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                bannerImage: true
            }
        });

        // 3. Fetch Latest Programs (Menu Items)
        const programs = await prisma.menuItem.findMany({
            where: { type: "PAGE", slug: { not: null } },
            take: 3,
            orderBy: { updatedAt: "desc" },
            select: {
                slug: true,
                label: true,
                pageDescription: true,
                updatedAt: true,
                pageImage: true
            }
        });

        // Map them to unified structure
        const newsItems: NotificationItem[] = news.map((n: any) => ({
            id: `news-${n.id}`,
            title: n.title,
            excerpt: n.content.substring(0, 60) + "...",
            createdAt: n.createdAt,
            url: `/berita/${n.id}`,
            type: "NEWS",
            image: n.image
        }));

        const campaignItems: NotificationItem[] = campaigns.map((c: any) => ({
            id: `campaign-${c.id}`,
            title: c.title,
            excerpt: c.description ? c.description.substring(0, 60) + "..." : "Program Donasi Baru",
            createdAt: c.createdAt,
            url: `/campaign/${c.id}`,
            type: "CAMPAIGN",
            image: c.bannerImage
        }));

        const programItems: NotificationItem[] = programs.map((p: any) => ({
            id: `program-${p.slug}`,
            title: p.label,
            excerpt: p.pageDescription ? p.pageDescription.substring(0, 60) + "..." : "Program Baru",
            createdAt: p.updatedAt,
            url: `/program/${p.slug}`,
            type: "PROGRAM",
            image: p.pageImage
        }));

        // Merge and Sort
        const all = [...newsItems, ...campaignItems, ...programItems]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);

        return all;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}
