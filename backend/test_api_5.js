const { initModel, analyzeSentiment } = require('./sentiment');

async function test() {
    await initModel();
    
    console.log("\n----- Test 1: Don't buy -----");
    const r1 = await analyzeSentiment("don't buy this product");
    console.log("-> RESULT 1:", JSON.stringify({ overallSentiment: r1.overallSentiment, confidence: r1.overallConfidence, aspects: r1.aspects }, null, 2));

    console.log("\n----- Test 2: Phrase Mappings -----");
    const r2 = await analyzeSentiment("delay tracking updates but the product is good");
    console.log("-> RESULT 2:", JSON.stringify({ overallSentiment: r2.overallSentiment, confidence: r2.overallConfidence, aspects: r2.aspects }, null, 2));

    console.log("\n----- Test 3: Compound Contrast -----");
    const r3 = await analyzeSentiment("not bad but laggy");
    console.log("-> RESULT 3:", JSON.stringify({ overallSentiment: r3.overallSentiment, confidence: r3.overallConfidence, aspects: r3.aspects }, null, 2));
}

test().catch(console.error);
