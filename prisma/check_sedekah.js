
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const item = await prisma.menuItem.findFirst({
        where: { href: '/sedekah-subuh' }
    });
    console.log("Found Item:", item);
}

main().then(() => prisma.$disconnect()).catch(console.error);
