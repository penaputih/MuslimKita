require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    console.log('Connecting...');
    try {
        const s = await prisma.settings.findMany();
        console.log('SETTINGS:', JSON.stringify(s, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
})();
