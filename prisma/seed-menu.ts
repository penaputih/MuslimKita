
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultMenuItems = [
    { label: "Hitung Zakat", icon: "Calculator", color: "bg-emerald-100 text-emerald-600", href: "/zakat", order: 1 },
    { label: "Wakaf Asrama", icon: "Tent", color: "bg-blue-100 text-blue-600", href: "/wakaf/asrama", order: 2 },
    { label: "Sedekah Subuh", icon: "HandHeart", color: "bg-rose-100 text-rose-600", href: "/sedekah-subuh", order: 3 },
    { label: "Jadwal Kajian", icon: "Calendar", color: "bg-amber-100 text-amber-600", href: "#", order: 4 },
    { label: "Al-Qur'an", icon: "BookOpen", color: "bg-violet-100 text-violet-600", href: "#", order: 5 },
    { label: "Info Majlis", icon: "Megaphone", color: "bg-cyan-100 text-cyan-600", href: "/berita", order: 6 },
    { label: "Tanya Syifa", icon: "MessageCircleQuestion", color: "bg-orange-100 text-orange-600", href: "/tanya-syifa", order: 7 },
    { label: "Lainya", icon: "LayoutGrid", color: "bg-gray-100 text-gray-600", href: "#", order: 8 },
];

async function main() {
    console.log("Seeding menu items...");
    for (const item of defaultMenuItems) {
        await prisma.menuItem.create({
            data: item,
        });
    }
    console.log("Menu items seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
