import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const folder = (data.get("folder") as string) || "misc";

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Debugging Logs
        const currentDir = process.cwd();
        console.log("Upload Debug [1/4]: Process CWD:", currentDir);

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.name);
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-"); // Replace special chars and collapse multiple hyphens
        const filename = sanitizedName + "-" + uniqueSuffix + extension;

        // Define upload path (root/uploads/[folder])
        // Sanitize folder to prevent directory traversal
        const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");
        const uploadDir = path.join(process.cwd(), "uploads", safeFolder);

        console.log("Upload Debug [2/4]: Target Dir:", uploadDir);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
            console.log("Upload Debug [3/4]: Mkdir success (or existed)");
        } catch (e: any) {
            console.error("Upload Debug: Mkdir Failed:", e);
            if (e.code !== 'EEXIST') {
                return NextResponse.json({ success: false, message: `Server Error: Cannot create folder. ${e.code}` }, { status: 500 });
            }
        }

        const filepath = path.join(uploadDir, filename);

        try {
            await writeFile(filepath, buffer);
            console.log("Upload Debug [4/4]: WriteFile success:", filepath);
        } catch (e: any) {
            console.error("Upload Debug: WriteFile Failed:", e);
            return NextResponse.json({ success: false, message: `Server Error: Cannot save file. ${e.code}` }, { status: 500 });
        }

        // Return the public URL
        const publicUrl = `/uploads/${safeFolder}/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error("Upload Fatal Error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
