import { prisma } from "@/lib/prisma";
import WidgetsClient from "./widgets-client";

export const dynamic = "force-dynamic";

export default async function WidgetsPage() {
    // Fetch specific settings for widgets
    const hadithWidgetActive = await prisma.settings.findUnique({ where: { key: "hadithWidgetActive" } });
    const prayerWidgetActive = await prisma.settings.findUnique({ where: { key: "prayerWidgetActive" } });
    const dailyWisdomActive = await prisma.settings.findUnique({ where: { key: "dailyWisdomActive" } });
    const zakatWidgetActive = await prisma.settings.findUnique({ where: { key: "zakatWidgetActive" } });
    const qrisImage = await prisma.settings.findUnique({ where: { key: "qrisImage" } });
    const bankAccount = await prisma.settings.findUnique({ where: { key: "bankAccount" } });

    // Fetch all hadiths
    const hadiths = await prisma.hadith.findMany({
        orderBy: { createdAt: "desc" }
    });

    const initialData = {
        hadithWidgetActive: hadithWidgetActive?.value,
        prayerWidgetActive: prayerWidgetActive?.value,
        dailyWisdomActive: dailyWisdomActive?.value,
        zakatWidgetActive: zakatWidgetActive?.value,
        qrisImage: qrisImage?.value,
        bankAccount: bankAccount?.value,
    };

    return <WidgetsClient initialData={initialData} hadiths={hadiths} />;
}
