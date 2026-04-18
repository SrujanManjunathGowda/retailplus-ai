const { initModel, analyzeSentiment } = require('./sentiment');
async function run() {
    await initModel();
    const r = await analyzeSentiment("Amazing product but delivery is late");
    console.log(JSON.stringify(r, null, 2));
}
run();
