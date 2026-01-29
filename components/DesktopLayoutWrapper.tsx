"use client";

import { usePathname } from "next/navigation";

export function DesktopLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Check if current path is admin dashboard
    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen w-full flex justify-center bg-slate-100 dark:bg-slate-950 relative">
            {/* Mobile View Container */}
            <div className="w-full max-w-[540px] min-h-screen bg-background shadow-2xl overflow-x-hidden relative z-10">
                {children}
            </div>
        </div>
    );
}
