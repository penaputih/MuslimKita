import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await prisma.settings.findMany();
        return NextResponse.json({
            count: settings.length,
            data: settings,
            env: process.env.NODE_ENV
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
