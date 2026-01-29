
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Forcing password column to be nullable...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE User MODIFY password VARCHAR(191) NULL;`);
        console.log("✅ Successfully altered password column to allow NULL.");
    } catch (e: any) {
        console.error("Error altering table:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
