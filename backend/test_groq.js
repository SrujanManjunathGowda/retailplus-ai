require('dotenv').config();
const { Groq } = require('groq-sdk');

async function testGroq() {
    console.log("Checking GROQ_API_KEY...");
    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing from process.env!");
        process.exit(1);
    }
    console.log("API Key found. Initializing Groq client...");
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say "hello world" in JSON format: {"msg": "..."}' }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });
        console.log("Groq Response:", chatCompletion.choices[0]?.message?.content);
    } catch(e) {
        console.error("Groq API Error:", e.message);
    }
}
testGroq();
