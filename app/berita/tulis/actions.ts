"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNews(formData: FormData) {
    const session = await getSession();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || (!user.isContributor && user.role !== "ADMIN")) {
        return { error: "Anda tidak memiliki akses untuk menulis berita" };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    // Author is automatically set to the user's name
    const author = user.name || "Kontributor";
    const image = formData.get("image") as string;

    if (!title || !content) {
        return { error: "Judul dan konten harus diisi" };
    }

    try {
        await prisma.news.create({
            data: {
                title,
                content,
                author,
                image: image || "bg-emerald-100", // Default placeholder if no image
            },
        });

        revalidatePath("/berita");
        revalidatePath("/admin/news");
    } catch (error) {
        console.error("Error creating news:", error);
        return { error: "Gagal membuat berita" };
    }

    redirect("/berita");
}
