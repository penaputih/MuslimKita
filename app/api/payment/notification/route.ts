import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const notification = await req.json();

        // 1. Verify Signature Key (Optional but recommended)
        // signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
        // For simplicity, we can trust Midtrans IP or use their SDK verification if available.
        // coreApi.transaction.notification(notification) handles verification implicitly often.

        const statusResponse = await coreApi.transaction.notification(notification);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`);

        let newStatus = "PENDING";

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                newStatus = "PENDING"; // Challenge
            } else if (fraudStatus == 'accept') {
                newStatus = "VERIFIED"; // Success
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = "VERIFIED"; // Success
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            newStatus = "PENDING"; // Failed/Cancelled (Should we have FAILED status? For now kept as PENDING or maybe delete?)
            // Ideally we should add FAILED enum. But schema has PENDING/VERIFIED. 
            // Let's stick to PENDING (unverified) or maybe add FAILED in future.
        } else if (transactionStatus == 'pending') {
            newStatus = "PENDING";
        }

        // Update DB
        if (newStatus === "VERIFIED") {
            const transaction = await prisma.transaction.update({
                where: { id: orderId },
                data: { status: "VERIFIED" }
            });

            // Logic to update Campaign amount if applicable
            if (transaction.campaignId) {
                await prisma.campaign.update({
                    where: { id: transaction.campaignId },
                    data: { currentAmount: { increment: transaction.amount } }
                });
            }
            // Logic to update MenuItem amount if applicable
            if (transaction.menuItemId) {
                await prisma.menuItem.update({
                    where: { id: transaction.menuItemId },
                    data: { currentAmount: { increment: transaction.amount } }
                });
            }
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
