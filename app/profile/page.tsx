import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { FloatingBottomNav } from "@/components/FloatingBottomNav";
import { ProfileForm, type UserProfile } from "./profile-form";

export default async function ProfilePage() {
    const session = await getSession();
    let user = null;

    if (session?.user) {
        user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });
    }

    // Transform user data to match ProfileForm interface or pass null
    const profileUser: UserProfile | null = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        image: user.image,
        isContributor: user.isContributor
    } : null;

    // Fetch Settings
    const settingsData = await prisma.settings.findMany({
        where: {
            key: {
                in: ["app_description", "contact_email", "contact_instagram", "contact_whatsapp"]
            }
        }
    });

    const settings = {
        description: settingsData.find(s => s.key === "app_description")?.value || "",
        email: settingsData.find(s => s.key === "contact_email")?.value || "",
        instagram: settingsData.find(s => s.key === "contact_instagram")?.value || "",
        whatsapp: settingsData.find(s => s.key === "contact_whatsapp")?.value || ""
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-[200px]">
            <Header title="Akun Saya" showBack backUrl="/" />

            <div className="px-4 mt-6">
                <ProfileForm user={profileUser} settings={settings} />
            </div>

            <FloatingBottomNav />
        </div>
    );
}
