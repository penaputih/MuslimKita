import { CalculatorCard } from "@/components/CalculatorCard";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export default async function ZakatPage() {
    const session = await getSession();
    // Fetch QRIS Image setting
    const qrisSetting = await prisma.settings.findUnique({
        where: { key: "qrisImage" }
    });

    // Fetch Zakat MenuItem ID for program linkage
    const menuItem = await prisma.menuItem.findFirst({
        where: { href: "/zakat" },
        select: { id: true }
    });

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-slate-950 pb-28">
            {/* Re-using Header for consistency, or we could make a simpler one */}
            <Header user={session?.user} />

            <div className="px-6 space-y-6">
                <div className="pt-6">
                    <h2 className="text-xl font-bold mb-2">Hitung Zakat Maal</h2>
                    <p className="text-muted-foreground text-sm mb-6">Hitung dan bayar zakat penghasilanmu dengan mudah.</p>
                    <CalculatorCard qrisImage={qrisSetting?.value} programId={menuItem?.id} />
                </div>
            </div>

            <FloatingBottomNav />
        </main>
    );
}
