"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNews(formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const author = formData.get("author") as string;
    // For MVP, we are not handling image upload yet, just a placeholder or URL input
    //Ideally effectively utilize cloud storage like AWS S3 or Uploadthing.
    const image = (formData.get("image") as string) || "bg-emerald-100";
    const isFeatured = formData.get("isFeatured") === "true";

    if (!title || !content || !author) {
        return { error: "Semua field harus diisi" };
    }

    try {
        await prisma.news.create({
            data: {
                title,
                content,
                author,
                image,
                isFeatured,
            },
        });
        revalidatePath("/admin/news");
        revalidatePath("/berita");
        return { success: true };
    } catch (error) {
        return { error: "Gagal membuat berita" };
    }
}

export async function deleteNews(id: string) {
    try {
        await prisma.news.delete({
            where: { id },
        });
        revalidatePath("/admin/news");
        revalidatePath("/berita");
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus berita" };
    }
}

export async function updateNews(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const author = formData.get("author") as string;
    const image = formData.get("image") as string;
    const isFeatured = formData.get("isFeatured") === "true";

    if (!title || !content || !author) {
        return { error: "Semua field harus diisi" };
    }

    try {
        await prisma.news.update({
            where: { id },
            data: {
                title,
                content,
                author,
                isFeatured,
                ...(image ? { image } : {}), // Only update image if provided
            },
        });
        revalidatePath("/admin/news");
        revalidatePath("/berita");
        return { success: true };
    } catch (error) {
        return { error: "Gagal mengupdate berita" };
    }
}
