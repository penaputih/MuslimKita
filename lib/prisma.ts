import { PrismaClient } from "@prisma/client";


const prismaClientSingleton = () => {
    console.log("Initializing Prisma Client...");
    // @ts-ignore
    const client = new PrismaClient();
    // Log the version to confirm we are loading the right one
    // @ts-ignore
    console.log("Prisma Client Version:", client._engineConfig?.clientVersion || "Unknown");
    return client;
};

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
