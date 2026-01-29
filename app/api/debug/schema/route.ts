
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Raw query to check columns in the Transaction table
        const columns = await prisma.$queryRaw`DESCRIBE Transaction`;
        // Also check Prisma Version if possible, or just return success
        return NextResponse.json({
            status: "ok",
            columns
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
