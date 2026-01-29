import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, image, sessionId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key hilang" }, { status: 500 });
        }

        const genAI = new GoogleGenAI({ apiKey });

        // 1. Ambil Tanggal & Jam Sekarang (Realtime Server)
        const now = new Date();
        const tanggalIndo = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const jamIndo = now.toLocaleTimeString('id-ID');

        // 2. Setting Kepribadian (Update System Prompt)
        const systemPrompt = `
      Kamu adalah 'Asisten Syifa', chatbot dari Majlis Ta'lim Daarussyifa.
      Nama Kamu Syifa yah, jangan gunakan nama asisten syifa.
      
      INFORMASI WAKTU SAAT INI:
      - Hari ini adalah: ${tanggalIndo}
      - Jam saat ini: ${jamIndo} WIB
      
      Instruksi:
      - Gunakan data waktu di atas jika user bertanya "kapan", "hari ini", atau "besok".
      - Gunakan bahasa Indonesia yang sopan, ramah, dan islami.
      - Jangan jawab pertanyaan SARA atau politik.
      - Jangan menampilkan informasi tentang asisten syifa.
      - Jika ada gambar yang disertakan, bantu jelaskan gambar tersebut dengan ramah.

      Informasi Majelis:
      - Jadwal kajian rutin majelis ta'lim dan dzikir daarussyifa adalah setiap hari selasa pukul 19.00 WIB.
    `;

        // Database Persistence Logic
        let currentSessionId = sessionId;
        const userMessageContent = messages[messages.length - 1].content;

        if (currentSessionId) {
            // Verify ownership
            const existingSession = await prisma.chatSession.findUnique({
                where: { id: currentSessionId },
            });

            if (!existingSession || existingSession.userId !== session.user.id) {
                currentSessionId = null;
            }
        }

        if (!currentSessionId) {
            // Create New Session
            const title = userMessageContent.split(" ").slice(0, 5).join(" ") + "...";
            const newSession = await prisma.chatSession.create({
                data: {
                    userId: session.user.id,
                    title: title,
                }
            });
            currentSessionId = newSession.id;
        }

        // Save User Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: "user",
                content: userMessageContent,
                image: image
            }
        });

        // Format history for V2 SDK
        const contents = messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Insert Image into the last user message if present
        if (image) {
            const lastMessage = contents[contents.length - 1];
            if (lastMessage.role === 'user') {
                const base64Data = image.split(",")[1] || image;
                lastMessage.parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data
                    }
                });
            }
        }

        const selectedModel = image ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";

        const response = await genAI.models.generateContent({
            model: selectedModel,
            contents,
            config: {
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            }
        });

        const reply = response.text || "Maaf, saya tidak dapat menjawab saat ini.";

        // Save AI Message
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: "model",
                content: reply
            }
        });

        return NextResponse.json({ reply, sessionId: currentSessionId, modelUsed: selectedModel });

    } catch (error: any) {
        console.error("Google GenAI SDK Error:", error);
        return NextResponse.json({ error: error.message || "Gagal koneksi AI" }, { status: 500 });
    }
}
