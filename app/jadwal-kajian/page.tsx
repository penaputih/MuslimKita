import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";

export const dynamic = "force-dynamic";

export default async function JadwalKajianPage() {
    const eventsData = await prisma.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
    });

    const events = eventsData.map(e => ({
        ...e,
        date: e.date.toISOString(),
    }));

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            <Header title="Jadwal Kajian" showBack backUrl="/" />

            <div className="pt-4">
                <UpcomingEvents events={events} showHeader={false} />
            </div>

            <FloatingBottomNav />
        </main>
    );
}
