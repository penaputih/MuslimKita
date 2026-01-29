"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMenuItem(data: any) {
    try {
        console.log("Creating Menu Item Payload:", data);

        // Explicitly map fields to avoid unknown arguments error
        const payload = {
            label: data.label,
            icon: data.icon,
            href: data.href,
            color: data.color,
            order: Number(data.order),
            isActive: data.isActive,
            type: data.type,
            template: data.template,
            slug: data.slug || null, // Convert empty string to null
            pageTitle: data.pageTitle || null,
            categoryLabel: data.categoryLabel || null,
            pageDescription: data.pageDescription || null,
            pageImage: data.pageImage || null,
            targetAmount: data.targetAmount ? Number(data.targetAmount) : undefined,
            currentAmount: data.currentAmount ? Number(data.currentAmount) : 0,
        };

        await prisma.menuItem.create({ data: payload });
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/menu");
        return { success: true };
    } catch (error: any) {
        console.error("Create Menu Error:", error);
        if (error.code === 'P2002') {
            return { error: "Slug/URL sudah digunakan. Ganti judul halaman." };
        }
        return { error: error.message || "Gagal membuat menu" };
    }
}

export async function updateMenuItem(id: string, data: any) {
    try {
        // Explicitly map fields
        const payload = {
            label: data.label,
            icon: data.icon,
            href: data.href,
            color: data.color,
            order: data.order ? Number(data.order) : undefined,
            isActive: data.isActive,
            type: data.type,
            template: data.template,
            slug: data.slug || null,
            pageTitle: data.pageTitle || null,
            categoryLabel: data.categoryLabel || null,
            pageDescription: data.pageDescription || null,
            pageImage: data.pageImage || null,
            targetAmount: data.targetAmount ? Number(data.targetAmount) : undefined,
            currentAmount: data.currentAmount ? Number(data.currentAmount) : undefined,
        };

        // Remove undefined keys so we don't overwrite with undefined
        Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

        await prisma.menuItem.update({
            where: { id },
            data: payload,
        });
        revalidatePath("/");
        revalidatePath("/admin/menu");
        return { success: true };
    } catch (error) {
        console.error("Update Menu Error:", error);
        return { error: "Failed to update menu item" };
    }
}

export async function deleteMenuItem(id: string) {
    try {
        await prisma.menuItem.delete({
            where: { id },
        });
        revalidatePath("/");
        revalidatePath("/admin/menu");
        return { success: true };
    } catch (error) {
        console.error("Delete Menu Error:", error);
        return { error: "Failed to delete menu item" };
    }
}
