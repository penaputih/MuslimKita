
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking News table columns...");
    try {
        const columns: any[] = await prisma.$queryRaw`SHOW COLUMNS FROM News;`;
        console.log("Current columns:", columns.map(c => c.Field).join(", "));

        const hasIsFeatured = columns.some(c => c.Field === 'isFeatured');

        if (hasIsFeatured) {
            console.log("isFeatured column already exists.");
        } else {
            console.log("Adding isFeatured column...");
            await prisma.$executeRawUnsafe(`ALTER TABLE News ADD COLUMN isFeatured BOOLEAN NOT NULL DEFAULT 0;`);
            console.log("isFeatured column added successfully.");
        }
    } catch (e: any) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
