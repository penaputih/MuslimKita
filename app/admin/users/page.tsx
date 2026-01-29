
import { prisma } from "@/lib/prisma";
import UsersClient from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Remove password from object before passing to client (security best practice)
    const safeUsers = users.map((user) => ({
        ...user,
        password: "", // Don't expose hashed password
    }));

    return (
        <UsersClient initialData={safeUsers} />
    );
}
