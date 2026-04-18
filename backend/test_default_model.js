const { pipeline } = require('@xenova/transformers');
async function test() {
    try {
        console.log("Loading default model...");
        const p = await pipeline('sentiment-analysis'); // uses distilbert-base-uncased-finetuned-sst-2-english
        const res = await p("don't buy this product, battery is low");
        console.log("RAW OUTPUT:", res);
    } catch(e) {
        console.error("FAILED TO LOAD OR RUN MODEL:", e.message);
    }
}
test();
