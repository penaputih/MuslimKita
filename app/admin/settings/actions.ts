"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
    try {
        const majlisName = formData.get("majlisName") as string;
        const majlisAddress = formData.get("majlisAddress") as string;
        const majlisPhone = formData.get("majlisPhone") as string;
        const bankAccount = formData.get("bankAccount") as string;
        const qrisImage = formData.get("qrisImage") as string;

        // Payment Settings
        const payment_online_active = formData.get("payment_online_active") as string;
        const payment_offline_active = formData.get("payment_offline_active") as string;

        // Helper to upsert
        const upsertSetting = async (key: string, value: string) => {
            if (value === undefined || value === null) return;
            await prisma.settings.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });
        }

        await upsertSetting("majlisName", majlisName);
        await upsertSetting("majlisAddress", majlisAddress);
        await upsertSetting("majlisPhone", majlisPhone);
        await upsertSetting("bankAccount", bankAccount);
        await upsertSetting("qrisImage", qrisImage);
        await upsertSetting("payment_online_active", payment_online_active);
        await upsertSetting("payment_offline_active", payment_offline_active);

        const runningText_content = formData.get("runningText_content") as string;
        const runningText_speed = formData.get("runningText_speed") as string;
        const runningText_isActive = formData.get("runningText_isActive") as string;

        await upsertSetting("runningText_content", runningText_content);
        await upsertSetting("runningText_speed", runningText_speed);
        await upsertSetting("runningText_isActive", runningText_isActive);

        // App Info & Contact
        const app_description = formData.get("app_description") as string;
        const contact_email = formData.get("contact_email") as string;
        const contact_whatsapp = formData.get("contact_whatsapp") as string;
        const contact_instagram = formData.get("contact_instagram") as string;

        await upsertSetting("app_description", app_description);
        await upsertSetting("contact_email", contact_email);
        await upsertSetting("contact_whatsapp", contact_whatsapp);
        await upsertSetting("contact_instagram", contact_instagram);

        revalidatePath("/", "layout");
        return { success: true };

    } catch (error) {
        console.error(error);
        return { error: "Gagal menyimpan pengaturan" };
    }
}
