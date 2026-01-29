
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Introspect dmmf
        // Accessing internal property _dmmf which contains the schema metadata
        const dmmf = prisma._dmmf;
        if (!dmmf) {
            console.log("Could not access _dmmf on Prisma Client instance.");
            return;
        }

        const userModel = dmmf.modelMap.User;
        if (!userModel) {
            console.log("User model not found in DMMF.");
            return;
        }

        const hasField = userModel.fields.some(f => f.name === 'verificationCode');
        console.log('DMMF has verificationCode:', hasField);

        // Also print fields for debugging
        if (!hasField) {
            console.log("Available fields:", userModel.fields.map(f => f.name).join(', '));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
