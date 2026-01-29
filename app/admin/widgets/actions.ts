"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWidgets(formData: FormData) {
    try {
        // Check for generic key/value update
        const key = formData.get("key") as string;
        const value = formData.get("value") as string;

        const upsertSetting = async (k: string, v: string) => {
            if (v === null || v === undefined) return;
            await prisma.settings.upsert({
                where: { key: k },
                update: { value: v },
                create: { key: k, value: v }
            });
        }

        if (key && value) {
            // Single setting update
            await upsertSetting(key, value);
        } else {
            // Bulk update (existing form)
            const bankAccount = formData.get("bankAccount") as string;
            const qrisImage = formData.get("qrisImage") as string;

            await upsertSetting("bankAccount", bankAccount);
            await upsertSetting("qrisImage", qrisImage);
        }

        revalidatePath("/admin/widgets");
        revalidatePath("/"); // Revalidate home too
        return { success: true };

    } catch (error) {
        console.error(error);
        return { error: "Gagal menyimpan pengaturan widget" };
    }
}

export async function toggleHadithWidget(isActive: boolean) {
    try {
        await prisma.settings.upsert({
            where: { key: "hadithWidgetActive" },
            update: { value: isActive ? "true" : "false" },
            create: { key: "hadithWidgetActive", value: isActive ? "true" : "false" }
        });
        revalidatePath("/admin/widgets");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal mengubah status widget" };
    }
}

export async function createHadith(formData: FormData) {
    try {
        const text = formData.get("text") as string;
        const source = formData.get("source") as string;

        await prisma.hadith.create({
            data: { text, source }
        });

        revalidatePath("/admin/widgets");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menambah hadits" };
    }
}

export async function deleteHadith(id: string) {
    try {
        await prisma.hadith.delete({ where: { id } });
        revalidatePath("/admin/widgets");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus hadits" };
    }
}
