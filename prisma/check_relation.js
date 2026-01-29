
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const item = await prisma.menuItem.findFirst({
            where: { href: '/sedekah-subuh' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
        console.log("Runtime check passed. count:", item?._count?.transactions);
    } catch (e) {
        console.error("Runtime check failed:", e.message);
    }
}

main().then(() => prisma.$disconnect()).catch(console.error);
