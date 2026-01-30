import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    const transactions = await prisma.transaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            },
            menuItem: {
                select: {
                    label: true,
                }
            },
            campaign: {
                select: {
                    title: true,
                }
            }
        }
    });

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Transaksi Donasi</h1>
            <DataTable columns={columns} data={transactions} />
        </div>
    );
}
