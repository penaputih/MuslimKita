import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const Session = await getSession();
        // Allow unauthenticated for general donations? Maybe yes, but better to track user if possible.
        // For now, let's allow guest logic if needed, but here we assume logged in or guest with simple data.

        const body = await req.json();
        const { amount, itemDetails, customerDetails, paymentType, menuItemId, campaignId } = body;

        // Create Order ID
        const orderId = `ZK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create DB Transaction
        const transaction = await prisma.transaction.create({
            data: {
                id: orderId,
                amount: amount,
                status: "PENDING",
                proofImage: "MIDTRANS_SNAP", // Placeholder
                paymentType: paymentType || "SNAP",
                customerDetails: customerDetails,
                userId: Session?.user?.id ?? null,
                menuItemId: menuItemId,
                campaignId: campaignId,
            }
        });

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: customerDetails,
            item_details: itemDetails,
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/history` // Redirect after finish
            }
        };

        const token = await snap.createTransactionToken(parameter);

        // Update DB with Token
        await prisma.transaction.update({
            where: { id: orderId },
            data: { snapToken: token }
        });

        return NextResponse.json({ token, orderId });

    } catch (error: any) {
        console.error("❌ MIDTRANS/PRISMA ERROR DETAILS ❌");
        console.error("Message:", error.message);
        // Log full object if possible to seeing validation errors
        console.dir(error, { depth: null });

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
