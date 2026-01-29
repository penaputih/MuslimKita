
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for Waris menu...");

    const existing = await prisma.menuItem.findFirst({
        where: { href: "/waris" }
    });

    if (existing) {
        console.log("Found existing Waris menu:", existing);
        await prisma.menuItem.update({
            where: { id: existing.id },
            data: {
                label: "Kalkulator Waris",
                isActive: true,
                order: 8
            }
        });
        console.log("Updated existing menu.");
    } else {
        console.log("Creating new Waris menu...");
        await prisma.menuItem.create({
            data: {
                label: "Kalkulator Waris",
                icon: "Scale",
                color: "bg-amber-100 text-amber-600",
                href: "/waris",
                order: 8,
                isActive: true,
                type: "LINK",
                template: "NONE"
            }
        });
        console.log("Created Waris menu.");
    }

    const all = await prisma.menuItem.findMany();
    console.log("Total items:", all.length);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
