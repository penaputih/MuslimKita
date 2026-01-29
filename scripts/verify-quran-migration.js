
const https = require('https');

const QURAN_API_BASE = "https://api.quran.gading.dev";

async function testSurahList() {
    console.log("Testing Surah List...");
    const url = `${QURAN_API_BASE}/surah`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.code !== 200) throw new Error("API returned non-200 code");

                    const firstItem = json.data[0];
                    const mapped = {
                        nomor: firstItem.number,
                        nama: firstItem.name.short,
                        namaLatin: firstItem.name.transliteration.id,
                        jumlahAyat: firstItem.numberOfVerses,
                        tempatTurun: firstItem.revelation.id,
                        arti: firstItem.name.translation.id,
                        deskripsi: firstItem.tafsir.id
                    };
                    console.log("Mapped Surah List Item (First):", mapped);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function testSurahDetail(nomor) {
    console.log(`Testing Surah Detail for ${nomor}...`);
    const url = `${QURAN_API_BASE}/surah/${nomor}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.code !== 200) throw new Error("API returned non-200 code");

                    const item = json.data;
                    const mapped = {
                        nomor: item.number,
                        nama: item.name.short,
                        namaLatin: item.name.transliteration.id,
                        jumlahAyat: item.numberOfVerses,
                        tempatTurun: item.revelation.id,
                        arti: item.name.translation.id,
                        deskripsi: item.tafsir.id,
                        firstAyah: {
                            nomorAyat: item.verses[0].number.inSurah,
                            teksArab: item.verses[0].text.arab,
                            teksLatin: item.verses[0].text.transliteration?.en,
                            teksIndonesia: item.verses[0].translation.id,
                            audio: item.verses[0].audio.primary
                        }
                    };
                    console.log("Mapped Surah Detail (First Ayah):", mapped);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

(async () => {
    try {
        await testSurahList();
        await testSurahDetail(1);
        console.log("✅ Verification Successful!");
    } catch (e) {
        console.error("❌ Verification Failed:", e);
    }
})();
