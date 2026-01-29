import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    const params = await props.params;
    try {
        // Reconstruct the file path from the "path" array param
        // params.path is ['folder', 'filename.ext']
        const filePath = path.join(process.cwd(), "uploads", ...params.path);

        // Security check: Ensure we are not traversing out of "uploads"
        // (path.join helps, but careful validation is good practice)
        if (!filePath.startsWith(path.join(process.cwd(), "uploads"))) {
            return new NextResponse("Access Denied", { status: 403 });
        }

        if (!existsSync(filePath)) {
            return new NextResponse("File Not Found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // Basic MIME type mapping
        const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable", // Cache aggressive since filenames are unique
            },
        });
    } catch (error) {
        console.error("Image Serve Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
