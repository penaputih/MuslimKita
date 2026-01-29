import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSurahList } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zaki.majelisdaarussyifa.my.id';

    // Static routes
    const routes = [
        '',
        '/login',
        '/register',
        '/quran',
        '/jadwal-kajian',
        '/berita',
        '/program',
        '/zakat',
        '/wakaf/asrama',
        '/sedekah-subuh',
        '/tanya-syifa',
        '/waris',
        '/about',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Dynamic Programs (Legacy Menu Items) - URL: /program/[slug]
    const programs = await prisma.menuItem.findMany({
        where: {
            type: 'PAGE',
            slug: {
                not: null
            }
        },
        select: {
            slug: true,
            updatedAt: true,
            createdAt: true
        }
    });

    const programRoutes = programs.map((c: any) => ({
        url: `${baseUrl}/program/${c.slug}`,
        lastModified: c.updatedAt || c.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic Campaigns - URL: /campaign/[id]
    const campaigns = await prisma.campaign.findMany({
        select: {
            id: true,
            createdAt: true
        }
    });

    const campaignRoutes = campaigns.map((c: any) => ({
        url: `${baseUrl}/campaign/${c.id}`,
        lastModified: c.createdAt,
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // Dynamic News - URL: /berita/[id]
    const news = await prisma.news.findMany({
        select: {
            id: true,
            createdAt: true
        }
    });

    const newsRoutes = news.map((n: any) => ({
        url: `${baseUrl}/berita/${n.id}`,
        lastModified: n.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic Surahs - URL: /quran/[id]
    const surahs = await getSurahList();
    const quranRoutes = surahs.map((s) => ({
        url: `${baseUrl}/quran/${s.nomor}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...programRoutes, ...campaignRoutes, ...newsRoutes, ...quranRoutes];
}
