import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { QuickActionGrid } from "@/components/QuickActionGrid";

import { FeaturedCampaigns } from "@/components/FeaturedCampaigns";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { prisma } from "@/lib/prisma";
import { HadithWidget } from "@/components/HadithWidget";
import { PrayerWidget } from "@/components/PrayerWidget";
import { DailyWisdom } from "@/components/DailyWisdom";
import { getPrayerTimes } from "@/lib/api";
import { RunningText } from "@/components/RunningText";
import { getSession } from "@/lib/auth";
import { NewsList } from "@/components/NewsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  // const prayerData = await getPrayerTimes("Bandung"); // Unused now

  const campaignsData = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: true }
  });

  const campaigns = campaignsData.map((c: any) => ({
    ...c,
    targetAmount: Number(c.targetAmount),
    currentAmount: Number(c.currentAmount),
    category: c.category.name
  }));

  const activeBanners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  let latestNewsRaw: any[] = [];
  try {
    latestNewsRaw = await prisma.$queryRaw`
        SELECT * FROM News 
        WHERE isFeatured = 1 
        ORDER BY createdAt DESC 
        LIMIT 5
      `;
  } catch (e) {
    console.error("Failed to fetch featured news, falling back to all news", e);
    latestNewsRaw = await prisma.$queryRaw`
        SELECT * FROM News 
        ORDER BY createdAt DESC 
        LIMIT 5
      `;
  }

  const latestNews = latestNewsRaw.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt), // Ensure date format
  }));

  // Fetch widget settings
  const hadithWidgetActive = await prisma.settings.findUnique({ where: { key: "hadithWidgetActive" } });
  const prayerWidgetActive = await prisma.settings.findUnique({ where: { key: "prayerWidgetActive" } });
  const dailyWisdomActive = await prisma.settings.findUnique({ where: { key: "dailyWisdomActive" } });
  const zakatWidgetActive = await prisma.settings.findUnique({ where: { key: "zakatWidgetActive" } });

  const hadiths = await prisma.hadith.findMany({
    orderBy: { createdAt: "desc" }
  });

  const isHadithActive = hadithWidgetActive?.value === "true";
  const isPrayerActive = prayerWidgetActive?.value === "true";
  const isWisdomActive = dailyWisdomActive?.value === "true";
  const isZakatActive = zakatWidgetActive?.value === "true";

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
      {/* Sticky Header Group */}
      <div className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <Header user={session?.user} />
        <RunningText />
      </div>

      {/* 2. Prayer Widget (Moved to Top) */}
      {isPrayerActive && (
        <div className="px-4 mt-6 mb-8">
          <PrayerWidget />
        </div>
      )}

      {/* 3. Quick Action Grid */}
      <QuickActionGrid />

      {/* Update Section (Hero Carousel + News) */}
      <section className="mb-6">
        <h2 className="px-4 text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
          Update
        </h2>
        <HeroCarousel slides={activeBanners} />
        <NewsList news={latestNews} />
      </section>



      {/* Daily Wisdom (Doa) */}
      {isWisdomActive && (
        <div className="px-4 mb-6">
          <DailyWisdom />
        </div>
      )}

      {/* Hadith Widget (Database-driven) */}
      <HadithWidget hadiths={hadiths} isActive={isHadithActive} />

      {/* 4. Featured Campaigns */}
      <FeaturedCampaigns campaigns={campaigns} />

      {/* Navigation */}
      <FloatingBottomNav />
    </main>
  );
}
