"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
    const title = formData.get("title") as string;
    const ustadzName = formData.get("ustadzName") as string;
    const dateStr = formData.get("date") as string;
    const time = formData.get("time") as string;
    const eventLocation = formData.get("location") as string;
    const posterImage = (formData.get("posterImage") as string) || null;

    if (!title || !ustadzName || !dateStr || !time || !eventLocation) {
        return { error: "Semua field harus diisi" };
    }

    try {
        await prisma.event.create({
            data: {
                title,
                ustadzName,
                date: new Date(dateStr),
                time,
                location: eventLocation,
                posterImage,
            },
        });
        revalidatePath("/admin/events");
        // Also revalidate home if we show it there
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal membuat event" };
    }
}

export async function deleteEvent(id: string) {
    try {
        await prisma.event.delete({
            where: { id },
        });
        revalidatePath("/admin/events");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus event" };
    }
}
