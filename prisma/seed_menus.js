
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultCategories = [
    { name: "Wakaf", slug: "wakaf" },
    { name: "Donasi", slug: "donasi" },
    { name: "Bencana", slug: "bencana" },
];

const defaultMenuItems = [
    { label: "Hitung Zakat", icon: "Calculator", color: "bg-emerald-100 text-emerald-600", href: "/zakat", order: 1 },
    { label: "Wakaf Asrama", icon: "Tent", color: "bg-blue-100 text-blue-600", href: "/wakaf/asrama", order: 2 },
    { label: "Sedekah Subuh", icon: "HandHeart", color: "bg-rose-100 text-rose-600", href: "/sedekah-subuh", order: 3 },
    { label: "Jadwal Kajian", icon: "Calendar", color: "bg-amber-100 text-amber-600", href: "/jadwal-kajian", order: 4 },
    { label: "Al-Qur'an", icon: "BookOpen", color: "bg-violet-100 text-violet-600", href: "/quran", order: 5 },
    { label: "Info Majlis", icon: "Megaphone", color: "bg-cyan-100 text-cyan-600", href: "/berita", order: 6 },
    { label: "Tanya Ustadz", icon: "BookOpen", color: "bg-orange-100 text-orange-600", href: "#", order: 7 },
    { label: "Lainya", icon: "LayoutGrid", color: "bg-gray-100 text-gray-600", href: "#", order: 8 },
];

async function main() {
    console.log("Restoring menus...")

    // 1. Seed Categories
    for (const cat of defaultCategories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: { name: cat.name, slug: cat.slug }
        });
    }
    console.log("Categories restored")

    // 2. Seed Menu Items
    for (const item of defaultMenuItems) {
        // Upsert to ensure they exist
        const exists = await prisma.menuItem.findFirst({ where: { label: item.label } });
        if (!exists) {
            await prisma.menuItem.create({ data: item });
        }
    }
    console.log("Menu Items restored")
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
