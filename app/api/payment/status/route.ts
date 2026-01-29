
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    try {
        // 1. Check local DB first
        const transaction = await prisma.transaction.findUnique({
            where: { id: orderId }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        if (transaction.status === "VERIFIED") {
            return NextResponse.json({ status: "VERIFIED" });
        }

        // 2. If Pending, check Midtrans directly (Sync fallback)
        try {
            const statusResponse = await (coreApi.transaction as any).status(orderId);
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            let isSuccess = false;

            if (transactionStatus == 'capture') {
                if (fraudStatus == 'challenge') {
                    // Still pending
                } else if (fraudStatus == 'accept') {
                    isSuccess = true;
                }
            } else if (transactionStatus == 'settlement') {
                isSuccess = true;
            }

            if (isSuccess) {
                // Update DB to VERIFIED
                await prisma.transaction.update({
                    where: { id: orderId },
                    data: { status: "VERIFIED" }
                });

                // Update Stats
                if (transaction.campaignId) {
                    await prisma.campaign.update({
                        where: { id: transaction.campaignId },
                        data: { currentAmount: { increment: transaction.amount } }
                    });
                }
                if (transaction.menuItemId) {
                    await prisma.menuItem.update({
                        where: { id: transaction.menuItemId },
                        data: { currentAmount: { increment: transaction.amount } }
                    });
                }

                return NextResponse.json({ status: "VERIFIED" });
            }
        } catch (midtransError) {
            console.error("Midtrans check failed:", midtransError);
            // Ignore error, just return current DB status
        }

        return NextResponse.json({ status: transaction.status });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
