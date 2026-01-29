export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
}

export interface Surah {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    audioFull: {
        "01": string;
        "02": string;
        "03": string;
        "04": string;
        "05": string;
    };
}

export interface Ayah {
    nomorAyat: number;
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
    audio: {
        "01": string;
        "02": string;
        "03": string;
        "04": string;
        "05": string;
    };
}

export interface SurahDetail extends Surah {
    ayat: Ayah[];
    suratSelanjutnya: false | Surah;
    suratSebelumnya: false | Surah;
}

export interface Tafsir {
    nomor: number;
    nama: string;
    namaLatin: string;
    tafsir: { ayat: number; teks: string }[];
}

export interface DailyDoa {
    id: number;
    doa: string;
    ayat: string;
    latin: string;
    artinya: string;
}

// Prayer Times API (Aladhan)
export async function getPrayerTimes(city: string = "Bandung", country: string = "Indonesia") {
    try {
        const res = await fetch(
            `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=20`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) throw new Error("Failed to fetch prayer times");

        const data = await res.json();
        return {
            timings: data.data.timings as PrayerTimes,
            date: data.data.date.hijri as HijriDate
        };
    } catch (error) {
        console.error("API Error (Prayer):", error);
        return null;
    }
}

// Quran API (Equran.id)
// API Docs: https://equran.id/apiv2/
const QURAN_API_BASE = "https://equran.id/api/v2";

export async function getSurahList() {
    try {
        const res = await fetch(`${QURAN_API_BASE}/surat`, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!res.ok) throw new Error("Failed to fetch surah list");

        const json = await res.json();
        const data = json.data as any[];

        // Map Equran response to our interface
        return data.map((item: any) => ({
            nomor: item.nomor,
            nama: item.nama,
            namaLatin: item.namaLatin,
            jumlahAyat: item.jumlahAyat,
            tempatTurun: item.tempatTurun,
            arti: item.arti,
            deskripsi: item.deskripsi,
            audioFull: item.audioFull
        })) as Surah[];

    } catch (error) {
        console.error("API Error (Quran List):", error);
        return [];
    }
}

export async function getSurahDetail(nomor: number) {
    try {
        const res = await fetch(`${QURAN_API_BASE}/surat/${nomor}`, {
            next: { revalidate: 86400 }
        });

        if (!res.ok) throw new Error("Failed to fetch surah detail");

        const json = await res.json();
        const data = json.data;

        // Map to SurahDetail interface
        const detail: SurahDetail = {
            nomor: data.nomor,
            nama: data.nama,
            namaLatin: data.namaLatin,
            jumlahAyat: data.jumlahAyat,
            tempatTurun: data.tempatTurun,
            arti: data.arti,
            deskripsi: data.deskripsi,
            audioFull: data.audioFull,

            // Map verses
            ayat: data.ayat.map((verse: any) => ({
                nomorAyat: verse.nomorAyat,
                teksArab: verse.teksArab,
                teksLatin: verse.teksLatin,
                teksIndonesia: verse.teksIndonesia,
                audio: verse.audio
            })),
            suratSelanjutnya: data.suratSelanjutnya,
            suratSebelumnya: data.suratSebelumnya
        };

        return detail;

    } catch (error) {
        console.error("API Error (Quran Detail):", error);
        return null;
    }
}

export async function getTafsir(nomor: number) {
    try {
        const res = await fetch(`${QURAN_API_BASE}/tafsir/${nomor}`, {
            next: { revalidate: 86400 }
        });

        if (!res.ok) throw new Error("Failed to fetch tafsir");

        const json = await res.json();
        // The API returns { data: { nomor, nama, ..., tafsir: [ { ayat, teks } ] } }
        // This matches our Tafsir interface structure
        return json.data as Tafsir;

    } catch (error) {
        console.error("API Error (Tafsir):", error);
        return null;
    }
}

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

// Daily Doa API
// Using a reliable open source API or fallback
export async function getRandomDoa() {
    try {
        // Using doa-doa-api-ahmadramadhan.fly.dev
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
