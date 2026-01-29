import { prisma } from "@/lib/prisma";
import { Megaphone } from "lucide-react";

export async function RunningText() {
    // Fetch settings
    const settings = await prisma.settings.findMany({
        where: {
            key: { in: ["runningText_content", "runningText_speed", "runningText_isActive"] }
        }
    });

    const config = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    if (config.runningText_isActive !== "true" || !config.runningText_content) {
        return null; // Don't render if inactive or empty
    }

    const speed = config.runningText_speed ? `${config.runningText_speed}s` : "20s";

    return (
        <div className="w-full bg-primary/10 text-primary overflow-hidden py-2 border-b border-primary/20 relative z-50">
            <div className="container mx-auto flex items-center gap-4 px-4">
                <div className="flex-shrink-0 bg-primary text-white p-1 rounded">
                    <Megaphone className="size-4" />
                </div>
                <div className="flex-1 overflow-hidden relative h-6">
                    <div
                        className="absolute whitespace-nowrap flex items-center"
                        style={{
                            animation: `marquee ${speed} linear infinite`,
                            width: "max-content"
                        }}
                    >
                        <span className="mr-8">{config.runningText_content}</span>
                        <span className="mr-8 opacity-50">•</span>
                        <span className="mr-8">{config.runningText_content}</span>
                        <span className="mr-8 opacity-50">•</span>
                        <span className="mr-8">{config.runningText_content}</span>
                        <span className="mr-8 opacity-50">•</span>
                        <span className="mr-8">{config.runningText_content}</span>
                        <span className="mr-8 opacity-50">•</span>
                    </div>
                </div>
            </div>
            <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
           `}</style>
        </div>
    );
}
