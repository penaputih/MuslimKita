import { prisma } from "@/lib/prisma";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function QuickActionGrid() {
    // Fetch active menu items from DB
    const actions = await prisma.menuItem.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
    });

    // Fallback if no items in DB (though we seeded them)
    // Inject Waris Manual Link for now
    const displayActions = [...actions];

    if (displayActions.length === 0) {
        return <div className="text-center text-sm py-4 text-muted-foreground">Menu belum tersedia.</div>;
    }

    return (
        <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-6 mb-8">
            {displayActions.map((action: any, index: number) => {
                // Dynamic Icon
                // Handle static icon name string mapping if needed, purely LucideIcons search
                const IconComponent = (LucideIcons as any)[action.icon] || LucideIcons.HelpCircle;

                return (
                    <Link key={action.id} href={action.href} className="flex flex-col items-center gap-2 group">
                        <div className={`size-14 rounded-full flex items-center justify-center ${action.color} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                            <IconComponent className="size-6" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground group-hover:text-foreground line-clamp-2 w-16">
                            {action.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
