import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to add isFeatured column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE News 
      ADD COLUMN isFeatured BOOLEAN NOT NULL DEFAULT 0;
    `);
        console.log('Successfully added isFeatured column.');
    } catch (error: any) {
        if (error.message.includes("Duplicate column name")) {
            console.log('Column isFeatured already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
