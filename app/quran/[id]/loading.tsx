import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";

export default function Loading() {
    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pb-28">
            <Header title="Memuat..." showBack backUrl="/quran" />

            {/* Info Card Skeleton */}
            <div className="bg-emerald-600/10 dark:bg-emerald-900/10 px-6 pt-4 pb-8 -mt-1 rounded-b-[2rem] mb-6">
                <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-8 w-40 bg-emerald-200/50 dark:bg-emerald-800/50" />
                    <Skeleton className="h-4 w-32 bg-emerald-200/50 dark:bg-emerald-800/50" />
                    <Skeleton className="h-3 w-64 bg-emerald-200/50 dark:bg-emerald-800/50 mt-1" />
                    <Skeleton className="h-8 w-28 rounded-md mt-4 bg-emerald-200/50 dark:bg-emerald-800/50" />
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Search Bar Skeleton (if exists in list view) or just List */}
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="pb-6 border-b border-neutral-100 dark:border-slate-800 last:border-0">
                            {/* Toolbar Skeleton */}
                            <div className="flex items-center justify-between mb-4 bg-neutral-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                <Skeleton className="h-6 w-16 rounded-md" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>

                            {/* Arabic Text Skeleton */}
                            <div className="flex justify-end mb-4">
                                <Skeleton className="h-8 w-3/4 rounded-lg" />
                            </div>

                            {/* Latin Text Skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <FloatingBottomNav />
        </main>
    );
}
