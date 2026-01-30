import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WakafProgram from "./wakaf-program";
import SedekahProgram from "./sedekah-program";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{
        slug: string;
    }>
}

export default async function ProgramPage({ params }: Props) {
    const { slug } = await params;

    const program = await prisma.menuItem.findUnique({
        where: { slug },
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    });

    if (!program || program.type !== "PAGE") {
        return notFound();
    }

    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    const qrisImage = settingsMap["qrisImage"];
    const bankAccount = settingsMap["bankAccount"];

    // Explicit string comparison
    const isOfflinePaymentActive = settingsMap["payment_offline_active"] === "true";

    // Online active by default ONLY if key is missing. If key exists, respect its value.
    const isOnlineSetting = settingsMap["payment_online_active"];
    const isOnlinePaymentActive = isOnlineSetting === undefined ? true : isOnlineSetting === "true";

    console.log(`[ProgramPage] Settings for ${slug}:`, JSON.stringify(settingsMap, null, 2));
    console.log(`[ProgramPage] Derived: Online=${isOnlinePaymentActive}, Offline=${isOfflinePaymentActive}`);

    // Aggregation for verified transactions
    const lastReset = program.lastResetAt || new Date(0);

    const verifiedAgg = await prisma.transaction.aggregate({
        where: {
            menuItemId: program.id,
            status: "VERIFIED",
            createdAt: { gt: lastReset }
        },
        _sum: { amount: true }
    });

    const currentAmount = Number(verifiedAgg._sum.amount || 0);

    const serializedProgram = {
        ...program,
        targetAmount: program.targetAmount ? Number(program.targetAmount) : 0,
        currentAmount: currentAmount,
    };

    if (program.template === "WAKAF") {
        return (
            <WakafProgram
                program={serializedProgram}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                isOfflinePaymentActive={isOfflinePaymentActive}
                isOnlinePaymentActive={isOnlinePaymentActive}
            />
        );
    }

    if (program.template === "SEDEKAH") {
        return (
            <SedekahProgram
                program={serializedProgram}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                isOfflinePaymentActive={isOfflinePaymentActive}
                isOnlinePaymentActive={isOnlinePaymentActive}
            />
        );
    }

    return <div>Template Unknown</div>;
}
