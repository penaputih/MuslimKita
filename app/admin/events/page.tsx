import { prisma } from "@/lib/prisma";
import EventsClient from "./events-client";

export default async function EventsPage() {
    const eventsData = await prisma.event.findMany({
        orderBy: { date: "asc" },
    });

    const events = eventsData.map(e => ({
        ...e,
        date: e.date.toISOString(),
    }));

    return <EventsClient initialData={events} />;
}
