"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function verifyTransaction(transactionId: string) {
    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "VERIFIED" },
        });

        // Revalidate everywhere to ensure totals update
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to verify transaction:", error);
        return { success: false, error: "Gagal memverifikasi transaksi" };
    }
}
