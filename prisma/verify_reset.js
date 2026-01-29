
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const userCount = await prisma.user.count()
    const campaignCount = await prisma.campaign.count()
    const transactionCount = await prisma.transaction.count()
    const menuItemCount = await prisma.menuItem.count()

    console.log(`Users: ${userCount}`)
    console.log(`Campaigns: ${campaignCount}`)
    console.log(`Transactions: ${transactionCount}`)
    console.log(`MenuItems: ${menuItemCount}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
