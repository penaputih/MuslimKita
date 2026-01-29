"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: FormData) {
    try {
        const name = data.get("name") as string;
        const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        if (!name) return { error: "Nama kategori harus diisi" };

        await prisma.category.create({
            data: { name, slug }
        });

        revalidatePath("/admin/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { error: "Gagal membuat kategori" };
    }
}

export async function updateCategory(id: string, data: FormData) {
    try {
        const name = data.get("name") as string;
        const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        if (!name) return { error: "Nama kategori harus diisi" };

        await prisma.category.update({
            where: { id },
            data: { name, slug }
        });

        revalidatePath("/admin/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { error: "Gagal mengupdate kategori" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        });

        revalidatePath("/admin/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { error: "Gagal menghapus kategori. Pastikan tidak ada campaign yang menggunakan kategori ini." };
    }
}
