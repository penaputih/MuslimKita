
const https = require('https');

function testTafsir() {
    const nomor = 1; // Al-Fatihah
    const url = `https://equran.id/api/v2/tafsir/${nomor}`;
    console.log(`Fetching ${url}...`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log("Response keys:", Object.keys(json));
                if (json.data) {
                    console.log("Data keys:", Object.keys(json.data));
                    if (json.data.tafsir) {
                        console.log("Tafsir format:", JSON.stringify(json.data.tafsir[0], null, 2));
                    } else {
                        console.log("Data format:", JSON.stringify(json.data, null, 2));
                    }
                }
            } catch (e) {
                console.error("Parse Error:", e);
                console.log("Raw Body:", data.substring(0, 200));
            }
        });
    }).on('error', (e) => {
        console.error("Req Error:", e);
    });
}

testTafsir();
