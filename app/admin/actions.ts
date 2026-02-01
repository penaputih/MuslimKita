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



export async function resetProgramStats(programId: string) {
    try {

        // 1. Reset yang Online
        await prisma.statsConfig.upsert({
            where: { key: `${programId}_ONLINE` }, // Hapus awalan PROGRAM_
            update: { resetAt: new Date() },
            create: { key: `${programId}_ONLINE`, resetAt: new Date() }
        });

        // 2. Reset yang Offline
        await prisma.statsConfig.upsert({
            where: { key: `${programId}_OFFLINE` }, // Hapus awalan PROGRAM_
            update: { resetAt: new Date() },
            create: { key: `${programId}_OFFLINE`, resetAt: new Date() }
        });

        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Gagal reset program stats:", error);
        return { success: false, error: "Gagal mereset data program donasi" };
    }
}