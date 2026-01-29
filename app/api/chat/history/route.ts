import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    try {
        if (sessionId) {
            // Fetch messages for a specific session
            const messages = await prisma.chatMessage.findMany({
                where: {
                    sessionId: sessionId,
                    session: { userId: session.user.id } // Ensure valid session and ownership
                },
                orderBy: { createdAt: 'asc' }
            });
            return NextResponse.json({ messages });
        } else {
            // Fetch list of sessions
            const sessions = await prisma.chatSession.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { messages: true }
                    }
                }
            });
            return NextResponse.json({ sessions });
        }
    } catch (error) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: "Gagal mengambil riwayat" }, { status: 500 });
    }
}
