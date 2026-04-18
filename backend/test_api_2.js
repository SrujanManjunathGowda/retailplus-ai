const { initModel, analyzeSentiment } = require('./sentiment');

async function test() {
    await initModel();
    const res = await analyzeSentiment("The delivery was super fast but the product quality is terrible");
    console.log(JSON.stringify(res, null, 2));
}

test().catch(console.error);
