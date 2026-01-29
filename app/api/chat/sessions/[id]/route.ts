import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in newer Next.js versions
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        // Verify ownership before deleting
        const chatSession = await prisma.chatSession.findUnique({
            where: { id },
        });

        if (!chatSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (chatSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the session (Cascading delete handles messages if configured in schema, otherwise need to delete messages first)
        // Schema has `onDelete: Cascade` for messages relation to ChatSession? 
        // Let's check schema. Yes, `session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)`

        await prisma.chatSession.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Session Error:", error);
        return NextResponse.json({ error: "Gagal menghapus percakapan" }, { status: 500 });
    }
}
