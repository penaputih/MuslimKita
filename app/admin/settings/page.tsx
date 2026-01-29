import { prisma } from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
    const settings = await prisma.settings.findMany();

    // Transform array to object for easier consumption
    const formattedSettings = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    return <SettingsClient initialData={formattedSettings} />;
}
