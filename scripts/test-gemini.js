const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Starting test...");

    // Manual .env reading to avoid dotenv dependency issues in this test
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const envPath = path.resolve(__dirname, '../.env');
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
                console.log("Found API Key in .env");
            }
        } catch (e) {
            console.error("Could not read .env file");
        }
    }

    if (!apiKey) {
        console.error("No API Key found. Exiting.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Explicitly listing known models to try
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro-latest", "gemini-1.5-pro"];

    const logFile = path.resolve(__dirname, 'test-result.txt');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear previous log
    fs.writeFileSync(logFile, '');

    log("Testing models connection...");

    for (const modelName of modelsToTry) {
        log(`Testing ${modelName}: `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            log(`SUCCESS!`);
            log("Response: " + result.response.text());
            return;
        } catch (e) {
            log(`FAILED. Error: ${e.message.split('\n')[0]}`);
        }
    }
    log("All models failed.");
}

main();
