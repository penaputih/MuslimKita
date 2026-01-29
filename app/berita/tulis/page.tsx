import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CreateNewsForm } from "./create-news-form";

export default async function WriteNewsPage() {
    const session = await getSession();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || (!user.isContributor && user.role !== "ADMIN")) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            <Header title="Tulis Berita" showBack backUrl="/profile" />

            <div className="px-4 mt-6 max-w-2xl mx-auto">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        Anda login sebagai kontributor. Berita yang Anda tulis akan dipublikasikan atas nama <strong>{user.name}</strong>.
                    </p>
                </div>

                <CreateNewsForm />
            </div>
        </div>
    );
}
