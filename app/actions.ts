"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DailyDoa, PrayerTimes, HijriDate } from "@/lib/api";



const FALLBACK_DOAS: DailyDoa[] = [
    {
        id: 1,
        doa: "Doa Kebaikan Dunia Akhirat",
        ayat: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        latin: "Rabbana atina fid-dunya hasanah wa fil akhirati hasanah, waqina adzabannar",
        artinya: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka."
    },
    {
        id: 2,
        doa: "Doa Memohon Ilmu yang Bermanfaat",
        ayat: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allahumma inni as-aluka 'ilman nafi'an, wa rizqan thayyiban, wa 'amalan mutaqabbalan",
        artinya: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima."
    },
    {
        id: 3,
        doa: "Doa Sebelum Makan",
        ayat: "اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        latin: "Allahumma barik lana fima razaqtana waqina 'adzaban-nar",
        artinya: "Ya Allah, berkahilah kepada kami semua rezeki yang telah Engkau karuniakan kepada kami, dan peliharalah kami dari siksa neraka."
    }
];

export async function fetchDailyDoa(): Promise<DailyDoa | null> {
    try {
        const res = await fetch("https://doa-doa-api-ahmadramadhan.fly.dev/api", {
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error("Failed to fetch doa");

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            return data[randomIndex] as DailyDoa;
        }

        throw new Error("Empty data");
    } catch (error) {
        console.error("API Error (Doa), using fallback:", error);
        // Return random fallback
        const randomIndex = Math.floor(Math.random() * FALLBACK_DOAS.length);
        return FALLBACK_DOAS[randomIndex];
    }
}



/**
 * Fetch prayer times by coordinates (for Geolocation)
 */
export async function fetchPrayerTimesByCoords(lat: number, lng: number) {
    try {
        // Method 20 = Kemenag RI (usually preferred in ID) or specific calculation
        const res = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=20`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch prayer times by coords");

        const data = await res.json();
        return {
            success: true,
            data: {
                timings: data.data.timings as PrayerTimes,
                date: data.data.date.hijri as HijriDate
            }
        };
    } catch (error) {
        console.error("API Error (Prayer Coords):", error);
        return { success: false, error: "Gagal mengambil jadwal sholat" };
    }
}

import { getSession } from "@/lib/auth";

// ... inside submitTransaction ...
export async function submitTransaction(formData: FormData) {
    const amountRaw = formData.get("amount") as string;
    const proofImage = formData.get("proofImage") as string;
    const programId = formData.get("programId") as string | null;

    if (!amountRaw) {
        return { error: "Amount is required" };
    }

    const amount = parseInt(amountRaw.replace(/\D/g, ""), 10);
    const session = await getSession();

    try {
        let campaignId = null;
        let menuItemId = null;

        if (programId) {
            const campaign = await prisma.campaign.findUnique({ where: { id: programId } });
            if (campaign) {
                campaignId = programId;
                await prisma.campaign.update({
                    where: { id: programId },
                    data: { currentAmount: { increment: amount } }
                });
            } else {
                const menuItem = await prisma.menuItem.findUnique({ where: { id: programId } });
                if (menuItem) {
                    menuItemId = programId;
                    await prisma.menuItem.update({
                        where: { id: programId },
                        data: { currentAmount: { increment: amount } }
                    });
                }
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: amount,
                proofImage: proofImage || "placeholder.png",
                status: "VERIFIED",
                userId: session?.user?.id || null,
                campaignId,
                menuItemId
            },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/program/[slug]"); // Revalidate dynamic pages
        return { success: true, transactionId: transaction.id };
    } catch (error) {
        console.error("Transaction Error:", error);
        return { error: "Failed to submit transaction" };
    }
}
