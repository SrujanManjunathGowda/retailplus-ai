const { initModel, analyzeSentiment } = require('./sentiment');
async function run() {
    await initModel();
    console.log("\n----- Test 1: Phrase Detection & Spelling Variations -----");
    const r1 = await analyzeSentiment("Product is gr8 but it took too long");
    console.log(JSON.stringify(r1, null, 2));

    console.log("\n----- Test 2: Hinglish / Kannada Complex -----");
    const r2 = await analyzeSentiment("Item tumba costly and service bakwas hai.");
    console.log(JSON.stringify(r2, null, 2));
}
run();
