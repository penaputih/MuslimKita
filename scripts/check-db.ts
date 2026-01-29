
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // MySQL specific query to get columns
        const columns: any = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'zakatkita' 
      AND TABLE_NAME = 'Transaction';
    `;
        console.log("Columns in Transaction table:", columns.map((c: any) => c.COLUMN_NAME));
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
