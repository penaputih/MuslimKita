
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking User table columns...");
    try {
        const columns: any[] = await prisma.$queryRaw`SHOW COLUMNS FROM User;`;
        const passwordColumn = columns.find(c => c.Field === 'password');

        if (passwordColumn) {
            console.log("Password Column Config:", JSON.stringify(passwordColumn, null, 2));
            if (passwordColumn.Null === 'YES') {
                console.log("✅ Password column allows NULL.");
            } else {
                console.log("❌ Password column does NOT allow NULL.");
            }
        } else {
            console.log("❌ Password column not found?!");
        }
    } catch (e: any) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
