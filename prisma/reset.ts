
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Start resetting data...")

    // 1. Delete dependent data first
    await prisma.transaction.deleteMany({})
    console.log("Deleted all Transactions")

    // 2. Delete main content
    await prisma.campaign.deleteMany({})
    console.log("Deleted all Campaigns")

    await prisma.event.deleteMany({})
    console.log("Deleted all Events")

    await prisma.announcement.deleteMany({})
    console.log("Deleted all Announcements")

    await prisma.news.deleteMany({})
    console.log("Deleted all News")

    await prisma.banner.deleteMany({})
    console.log("Deleted all Banners")

    await prisma.hadith.deleteMany({})
    console.log("Deleted all Hadiths")

    // 3. Delete structural content
    await prisma.menuItem.deleteMany({})
    console.log("Deleted all MenuItems")

    await prisma.category.deleteMany({})
    console.log("Deleted all Categories")

    // 4. Delete Users (except ADMIN)
    await prisma.user.deleteMany({
        where: {
            role: {
                not: 'ADMIN' // Preserve ADMINs
            }
        }
    })
    console.log("Deleted non-admin Users")

    console.log("Reset complete.")
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
