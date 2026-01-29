
const https = require('https');

const url = 'https://api.quran.gading.dev/surah/1';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Surah Data Keys:", Object.keys(json.data));
            if (json.data.audio) {
                console.log("Surah Audio:", json.data.audio);
            } else {
                console.log("No surah-level audio field found.");
            }

            if (json.data.verses && json.data.verses[0]) {
                console.log("Verse Audio:", json.data.verses[0].audio);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
}).on('error', console.error);
