const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching settings...');
    const settings = await prisma.settings.findMany();
    console.log('All Settings:', settings);

    const relevantKeys = ["app_description", "contact_email", "contact_instagram", "contact_whatsapp"];
    const relevantSettings = await prisma.settings.findMany({
        where: {
            key: { in: relevantKeys }
        }
    });
    console.log('Relevant Settings:', relevantSettings);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
