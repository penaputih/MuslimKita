"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client"; // Use Enum from Prisma Client
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    if (!name || !email || !password || !role) {
        return { error: "Semua field harus diisi" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "Email sudah terdaftar" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { error: "Gagal membuat user" };
    }
}

export async function updateUserRole(id: string, role: Role) {
    try {
        await prisma.user.update({
            where: { id },
            data: { role },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { error: "Gagal mengubah role user" };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Gagal menghapus user" };
    }
}

export async function toggleUserVerification(id: string, isVerified: boolean) {
    try {
        await prisma.user.update({
            where: { id },
            data: { isVerified },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user verification:", error);
        return { error: `Gagal mengubah status verifikasi user: ${error.message}` };
    }
}

export async function toggleUserWarisAccess(id: string, canAccess: boolean) {
    try {
        await prisma.user.update({
            where: { id },
            data: { canAccessWaris: canAccess },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating waris access:", error);
        return { error: `Gagal mengubah status akses waris: ${error.message}` };
    }
}

export async function toggleUserContributor(id: string, isContributor: boolean) {
    try {
        // Using executeRawUnsafe as a temporary workaround for persistent Prisma Client cache issues
        // preventing the recognition of the new isContributor field.
        // In a normal environment, prisma.user.update is preferred.
        await prisma.$executeRawUnsafe(
            `UPDATE User SET isContributor = ? WHERE id = ?`,
            isContributor ? 1 : 0,
            id
        );

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating contributor status:", error);
        return { error: `Gagal mengubah status kontributor: ${error.message}` };
    }
}
