require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiService = require('./services/aiService'); // Verify this loads


async function testConnection() {
    console.log("1. Checking API Key...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }
    console.log("✅ API Key found (starts with: " + key.substring(0, 5) + "...)");

    const genAI = new GoogleGenerativeAI(key);

    // List of models to test
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    console.log("\n2. Testing Models...");

    for (const modelName of modelsToTest) {
        try {
            console.log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello' if you can hear me.");
            const response = await result.response;
            console.log(`✅ Success! Response: ${response.text().trim()}`);
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
}

testConnection();
