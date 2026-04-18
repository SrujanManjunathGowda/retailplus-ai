async function test() {
    const url = "https://huggingface.co/Xenova/cardiffnlp-twitter-roberta-base-sentiment/resolve/main/tokenizer.json";
    try {
        const fetch = (await import('node-fetch')).default || global.fetch;
        if (!fetch) throw new Error("no fetch");
        console.log("Fetching...");
        const res = await fetch(url);
        console.log("Status:", res.status);
        console.log("Headers:", JSON.stringify([...res.headers], null, 2));
    } catch(e) {
        console.error("error:", e);
    }
}
test();
