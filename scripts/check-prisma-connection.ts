import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Prisma Connection...");
    try {
        await prisma.$connect();
        console.log("Successfully connected to database.");
        const count = await prisma.campaign.count();
        console.log(`Found ${count} campaigns.`);
    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
