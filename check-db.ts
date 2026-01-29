
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Connection...');

    try {
        // 1. Fetch Categories
        const categories = await prisma.category.findMany();
        console.log('Categories found:', categories.length);
        console.log(categories);

        // 2. Fetch Campaigns with Category
        const campaigns = await prisma.campaign.findMany({
            include: {
                category: true
            }
        });
        console.log('Campaigns found:', campaigns.length);
        if (campaigns.length > 0) {
            console.log('First Campaign Category:', campaigns[0].category);
        }

        console.log('SUCCESS: Database and Client are in sync.');
    } catch (e) {
        console.error('ERROR during query execution:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
