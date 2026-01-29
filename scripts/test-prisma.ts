
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Prisma Client...");

    // 1. Check if the model has the field in its DMMF (internal metadata)
    // Accessing internals is tricky, so we'll just try a safe findFirst

    try {
        const user = await prisma.user.findFirst();
        if (user) {
            console.log("Found user:", user.email);
            // Explicitly check if the property exists on the object
            console.log("isContributor value:", (user as any).isContributor);

            // Try an update (safe one, just setting it to what it is or false)
            await prisma.user.update({
                where: { id: user.id },
                data: { isContributor: false }
            });
            console.log("Update successful!");
        } else {
            console.log("No users found to test.");
        }
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
