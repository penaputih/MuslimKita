
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const items = await prisma.menuItem.findMany();
    console.log("Current Menu Items:", JSON.stringify(items, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
