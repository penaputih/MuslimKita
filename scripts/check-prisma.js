const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log("Starting connection test...");

prisma.$connect()
    .then(() => {
        console.log('Connected successfully!');
        return prisma.campaign.count();
    })
    .then(count => {
        console.log('Campaign count:', count);
        process.exit(0);
    })
    .catch(e => {
        console.error('Connection failed:', e);
        process.exit(1);
    });
