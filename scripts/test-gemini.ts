import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching available models...");

    try {
        // There isn't a direct "listModels" on the instance in some versions, 
        // but let's try to just invoke a simple generation on a few common models 
        // to see which one works, OR if the library exposes listModels via a different manager.
        // Actually, for the JS SDK, listing models is not always straightforward in the helper.
        // Let's try `gemini-1.5-flash` again but printing the specific error if it fails.

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`SUCCESS: ${modelName} is working.`);
                console.log(result.response.text());
                break;
            } catch (e: any) {
                console.log(`FAILED: ${modelName} - ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Global Error:", error);
    }
}

main();
