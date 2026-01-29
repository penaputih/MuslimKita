"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBanner(formData: FormData) {
    const title = formData.get("title") as string;
    const subtitle = (formData.get("subtitle") as string) || "";
    const image = (formData.get("image") as string) || "bg-emerald-900";
    const ctaText = (formData.get("ctaText") as string) || "Lihat Detail";
    const ctaLink = (formData.get("ctaLink") as string) || "#";
    const isActive = formData.get("isActive") === "on";

    if (!title) {
        return { error: "Judul wajib diisi" };
    }

    try {
        await prisma.banner.create({
            data: {
                title,
                subtitle,
                image,
                ctaText,
                ctaLink,
                isActive: true, // Default active on create
            },
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal membuat banner" };
    }
}

export async function updateBanner(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const image = formData.get("image") as string;
    const ctaText = formData.get("ctaText") as string;
    const ctaLink = formData.get("ctaLink") as string;
    // isActive checkbox logic: present = "on", missing = null. BUT let's handle it more explicitly if needed.
    // For now, let's assume we handle isActive via a separate toggle or include it here if the form sends it.

    if (!title) {
        return { error: "Judul wajib diisi" };
    }

    try {
        await prisma.banner.update({
            where: { id },
            data: {
                title,
                subtitle,
                ...(image ? { image } : {}),
                ctaText,
                ctaLink,
            },
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal update banner" };
    }
}

export async function deleteBanner(id: string) {
    try {
        await prisma.banner.delete({
            where: { id },
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus banner" };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    try {
        await prisma.banner.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Gagal update status banner" };
    }
}
