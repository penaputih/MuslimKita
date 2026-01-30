import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        // Allow unauthenticated for general donations? For now, we allow it but track user if logged in.

        const body = await req.json();
        const { amount, paymentType, menuItemId, campaignId, proofImage, customerDetails } = body;

        // Validation
        if (!amount || !proofImage) {
            return NextResponse.json({ error: "Jumlah donasi dan bukti transfer wajib diisi" }, { status: 400 });
        }

        // Create Order ID
        const orderId = `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create DB Transaction
        const transaction = await prisma.transaction.create({
            data: {
                id: orderId,
                amount: amount,
                status: "VERIFIED", // Auto-verify for immediate stats update
                proofImage: proofImage,
                paymentType: "OFFLINE",
                customerDetails: customerDetails,
                userId: session?.user?.id ?? null,
                menuItemId: menuItemId,
                campaignId: campaignId,
            }
        });

        // Optional: Notify Admin (e.g., via Email or just let them check dashboard)

        return NextResponse.json({ success: true, transaction });

    } catch (error: any) {
        console.error("OFFLINE PAYMENT ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
