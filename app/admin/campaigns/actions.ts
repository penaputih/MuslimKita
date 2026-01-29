"use server";

import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
    const title = formData.get("title") as string;
    const targetAmount = formData.get("targetAmount") as string;
    const categoryId = formData.get("categoryId") as string;
    const bannerImage = (formData.get("bannerImage") as string) || "bg-blue-100"; // Placeholder or uploaded URL

    if (!title || !targetAmount || !categoryId) {
        return { error: "Semua field harus diisi" };
    }

    try {
        await prisma.campaign.create({
            data: {
                title,
                targetAmount: parseFloat(targetAmount),
                categoryId, // Relational Field
                bannerImage,
                description: (formData.get("description") as string) || "",
            },
        });
        revalidatePath("/admin/campaigns");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Gagal membuat program" };
    }
}

export async function updateCampaign(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const targetAmount = formData.get("targetAmount") as string;
    const categoryId = formData.get("categoryId") as string;
    const description = (formData.get("description") as string) || "";
    const bannerImage = formData.get("bannerImage") as string;

    if (!title || !targetAmount || !categoryId) {
        return { error: "Semua field harus diisi" };
    }

    try {
        await prisma.campaign.update({
            where: { id },
            data: {
                title,
                targetAmount: parseFloat(targetAmount),
                categoryId,
                description,
                ...(bannerImage ? { bannerImage } : {}), // Only update if new image provided
            },
        });
        revalidatePath("/admin/campaigns");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal mengupdate program" };
    }
}

export async function deleteCampaign(id: string) {
    try {
        await prisma.campaign.delete({
            where: { id },
        });
        revalidatePath("/admin/campaigns");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus program" };
    }
}
