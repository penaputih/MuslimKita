
async function testTafsir() {
    const nomor = 1; // Al-Fatihah
    const url = `https://equran.id/api/v2/tafsir/${nomor}`;
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("Failed:", res.status, res.statusText);
            return;
        }
        const json = await res.json();
        console.log("Response keys:", Object.keys(json));
        if (json.data) {
            console.log("Data keys:", Object.keys(json.data));
            // Check if it's array or object
            if (json.data.tafsir) {
                console.log("Tafsir sample:", json.data.tafsir[0]);
            } else {
                console.log("Data sample:", json.data);
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testTafsir();
