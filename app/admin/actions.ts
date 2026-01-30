"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetStats(category: string, type: "ONLINE" | "OFFLINE") {
    try {
        const key = `${category}_${type}`;

        await prisma.statsConfig.upsert({
            where: { key },
            update: { resetAt: new Date() },
            create: {
                key,
                resetAt: new Date()
            }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to reset stats:", error);
        return { success: false, error: "Failed to reset stats" };
    }
}
