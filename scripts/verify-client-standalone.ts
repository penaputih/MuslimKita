
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Client...');
    const email = `test-${Date.now()}@example.com`;

    try {
        const user = await prisma.user.create({
            data: {
                email,
                name: 'Test User',
                password: 'password',
                role: 'MEMBER',
                verificationCode: '123456',
                verificationCodeExpires: new Date()
            }
        });
        console.log('✅ SUCCESS: User created with verificationCode!');
        await prisma.user.delete({ where: { id: user.id } });
    } catch (e: any) {
        console.error('❌ FAILURE:', e.message);
        if (e.message.includes('Unknown argument')) {
            console.error('CRITICAL: The Prisma Client on disk is OLD.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
