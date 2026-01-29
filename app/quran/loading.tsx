import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";

export default function Loading() {
    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            <Header title="Al-Qur'an Digital" showBack backUrl="/" />

            <div className="px-4 space-y-6">
                {/* Search Bar Skeleton */}
                <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 -mx-4 shadow-sm border-b border-neutral-100 dark:border-slate-800">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                {/* List Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-neutral-100 dark:border-slate-800 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            <FloatingBottomNav />
        </main>
    );
}
