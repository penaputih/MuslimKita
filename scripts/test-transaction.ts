
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting test-transaction...");
    const orderId = `TEST-${Date.now()}`;

    try {
        console.log("Attempting to create transaction with new fields...");
        const result = await prisma.transaction.create({
            data: {
                id: orderId,
                amount: 10000,
                proofImage: "TEST_IMAGE",
                status: "PENDING",
                paymentType: "TEST_PAYMENT", // The field in question
                // snapToken is optional, let's omit it first or include it
                snapToken: "token-123"
            }
        });
        console.log("✅ Success! Transaction created:", result);

        // Cleanup
        await prisma.transaction.delete({ where: { id: orderId } });
        console.log("Cleanup done.");

    } catch (e) {
        console.error("❌ Failed to create transaction:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
