const { pipeline } = require('@xenova/transformers');
async function test() {
    try {
        console.log("Loading model...");
        const p = await pipeline('sentiment-analysis', 'Xenova/cardiffnlp-twitter-roberta-base-sentiment');
        const res = await p("don't buy this product, battery is low");
        console.log("\nRAW OUTPUT:", res);
    } catch(e) {
        console.error("FAILED TO LOAD OR RUN MODEL:", e.message);
    }
}
test();
