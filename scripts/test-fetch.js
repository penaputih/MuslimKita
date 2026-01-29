const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API Key manually
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
            console.log("Found API Key.");
        }
    } catch (e) { }
}

if (!apiKey) {
    console.error("No API Key found.");
    process.exit(1);
}

const inputs = [
    { name: "gemini-1.5-flash (v1beta)", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: "gemini-pro (v1beta)", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}` },
    { name: "gemini-1.0-pro (v1beta)", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}` },
    { name: "gemini-pro (v1)", url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}` },
];

async function testUrl(label, url) {
    console.log(`Testing: ${label}`);

    return new Promise((resolve) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        });

        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`[SUCCESS] ${label}`);
                    console.log(data.substring(0, 100) + "...");
                    resolve(true);
                } else {
                    console.log(`[FAILED] ${label} - Status: ${res.statusCode}`);
                    try {
                        const err = JSON.parse(data);
                        console.log(`Error: ${err.error?.message || data}`);
                    } catch {
                        console.log(`Error: ${data}`);
                    }
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`[ERROR] ${label}: ${e.message}`);
            resolve(false);
        });

        req.write(body);
        req.end();
    });
}

async function main() {
    for (const input of inputs) {
        const success = await testUrl(input.name, input.url);
        if (success) {
            console.log("\nFOUND WORKING MODEL! Stopping tests.");
            process.exit(0);
        }
    }
    console.log("\nAll tests failed.");
}

main();
