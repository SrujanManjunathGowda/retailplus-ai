const { pipeline, env } = require('@xenova/transformers');

// Prevent progress bars from polluting output
env.cacheDir = './.cache';

async function test() {
    try {
        console.log("Loading default model...");
        const p = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        const res = await p("don't buy this product, battery is low");
        console.log("\nRAW OUTPUT:", res);
    } catch(e) {
        console.error("FAILED TO LOAD OR RUN MODEL:", e.message);
    }
}
test();
