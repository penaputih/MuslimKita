
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking transactions...");
    const transactions = await prisma.transaction.findMany({
        include: {
            menuItem: true,
            campaign: true
        }
    });

    console.log(`Found ${transactions.length} transactions.`);
    transactions.forEach(tx => {
        console.log(`- ID: ${tx.id}, Amount: ${tx.amount}, Status: ${tx.status}, Type: ${tx.paymentType}, Menu: ${tx.menuItem?.label}, Campaign: ${tx.campaign?.title}`);
    });
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
