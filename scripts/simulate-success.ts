
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const orderId = args[0];

    if (!orderId) {
        console.error("Please provide an Order ID");
        process.exit(1);
    }

    console.log(`Simulating success for Order: ${orderId}`);

    // Update Transaction
    const transaction = await prisma.transaction.update({
        where: { id: orderId },
        data: { status: "VERIFIED" }
    });
    console.log(`Transaction ${orderId} verified.`);

    // Update Stats
    if (transaction.campaignId) {
        await prisma.campaign.update({
            where: { id: transaction.campaignId },
            data: { currentAmount: { increment: transaction.amount } }
        });
        console.log(`Campaign ${transaction.campaignId} updated.`);
    }

    if (transaction.menuItemId) {
        await prisma.menuItem.update({
            where: { id: transaction.menuItemId },
            data: { currentAmount: { increment: transaction.amount } }
        });
        console.log(`Menu Item ${transaction.menuItemId} updated.`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
