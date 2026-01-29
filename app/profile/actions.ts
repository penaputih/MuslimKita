"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash, compare } from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const image = formData.get("image") as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                ...(image ? { image } : {})
            }
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Profile Update Error:", error);
        return { error: "Gagal mengupdate profil." };
    }
}

export async function changePassword(formData: FormData) {
    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
        return { error: "Konfirmasi password tidak sesuai." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { error: "User not found" };

        const isMatch = user.password ? await compare(currentPassword, user.password) : false;
        if (!isMatch) {
            return { error: "Password saat ini salah." };
        }

        const hashedPassword = await hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Password Change Error:", error);
        return { error: "Gagal mengganti password." };
    }
}

export async function logout() {
    (await cookies()).set("session", "", { expires: new Date(0) });
    redirect("/login");
}
