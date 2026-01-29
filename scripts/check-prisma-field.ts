
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Attempt to access the field in a type-safe way (if compiled) or just at runtime to see if it throws
        // We want to check if types allow it. 
        // Since this is run via ts-node or similar, if types are wrong, it might complain during compilation if we compile it.
        // usage of 'verificationCode'
        const user = await prisma.user.findFirst();
        if (user) {
            console.log('User verificationCode:', user.verificationCode);
        }

        // Check if we can use it in update
        // This is just a syntax check effectively if we were compiling, but runtime it won't fail unless prisma throws validation error
        console.log('Prisma Client has verificationCode field:', 'verificationCode' in prisma.user.fields ? 'Yes' : 'Maybe (runtime check hard)');

        // Better check: introspect dmmf
        const dmmf = (prisma as any)._dmmf;
        const userModel = dmmf.modelMap.User;
        const hasField = userModel.fields.some((f: any) => f.name === 'verificationCode');
        console.log('DMMF has verificationCode:', hasField);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
