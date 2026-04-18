const { initModel, analyzeSentiment } = require('./sentiment');

async function test() {
    await initModel();
    console.log("\n--- TEST 1: Complex Review ---");
    const r1 = await analyzeSentiment("Amazing product but delivery is late");
    console.log(JSON.stringify(r1, null, 2));

    console.log("\n--- TEST 2: Multilingual ---");
    const r2 = await analyzeSentiment("tumba costly item and service is bekar");
    console.log(JSON.stringify(r2, null, 2));

    console.log("\n--- TEST 3: Spelling Error ---");
    const r3 = await analyzeSentiment("definitly a great packging");
    console.log(JSON.stringify(r3, null, 2));

    console.log("\n--- TEST 4: Meaningless ---");
    const r4 = await analyzeSentiment("qwerpoiu");
    console.log(JSON.stringify(r4, null, 2));
}

test().catch(console.error);
