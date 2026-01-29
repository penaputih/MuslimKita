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
    const qrisImage = settings.find((s) => s.key === "qrisImage")?.value;
    const bankAccount = settings.find((s) => s.key === "bankAccount")?.value;

    const serializedProgram = {
        ...program,
        targetAmount: program.targetAmount ? Number(program.targetAmount) : 0,
        currentAmount: program.currentAmount ? Number(program.currentAmount) : 0,
    };

    const totalDonors = program._count.transactions;

    if (program.template === "WAKAF") {
        return (
            <WakafProgram
                program={serializedProgram}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                totalDonors={totalDonors}
            />
        );
    }

    if (program.template === "SEDEKAH") {
        return (
            <SedekahProgram
                program={serializedProgram}
                qrisImage={qrisImage}
                bankAccount={bankAccount}
                totalDonors={totalDonors}
            />
        );
    }

    return <div>Template Unknown</div>;
}
