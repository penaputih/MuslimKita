const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API Key manually
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
            }
        }
    } catch (e) { }
}

const logFile = path.resolve(__dirname, 'debug-output.txt');
fs.writeFileSync(logFile, `Starting Debug at ${new Date().toISOString()}\nAPI Key found: ${!!apiKey}\n\n`);

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

if (!apiKey) {
    log("CRITICAL: No API Key found.");
    process.exit(1);
}

const endpoints = [
    // v1beta
    { name: "v1beta / gemini-1.5-flash", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: "v1beta / gemini-pro", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}` },
    { name: "v1beta / gemini-1.0-pro", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}` },

    // v1 (Stable)
    { name: "v1 / gemini-pro", url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}` },
    { name: "v1 / gemini-1.5-flash", url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
];

async function testEndpoint(label, url) {
    return new Promise((resolve) => {
        log(`Testing: ${label}...`);

        const body = JSON.stringify({
            contents: [{ parts: [{ text: "Tes koneksi" }] }]
        });

        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (c) => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    log(`[SUCCESS] ${label} - OK`);
                    resolve(true);
                } else {
                    log(`[FAILED] ${label} - Status: ${res.statusCode}`);
                    try {
                        const err = JSON.parse(data);
                        log(`Error Msg: ${JSON.stringify(err)}`);
                    } catch {
                        log(`Response Body: ${data.substring(0, 200)}`);
                    }
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            log(`[ERROR] ${label} - Exception: ${e.message}`);
            resolve(false);
        });

        req.write(body);
        req.end();
    });
}

(async () => {
    for (const ep of endpoints) {
        if (await testEndpoint(ep.name, ep.url)) {
            log("\nWINNER FOUND! Stopping.");
            process.exit(0);
        }
    }
    log("\nAll endpoints failed.");
})();
