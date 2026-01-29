import { getSurahList } from "@/lib/api";
import { SurahList } from "./surah-list";
import { Header } from "@/components/Header";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";

export const dynamic = "force-dynamic";

export default async function QuranPage() {
    const surahs = await getSurahList();

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            <Header title="Al-Qur'an Digital" showBack backUrl="/" />

            <div className="px-4">
                <SurahList surahs={surahs} />
            </div>

            <FloatingBottomNav />
        </main>
    );
}
