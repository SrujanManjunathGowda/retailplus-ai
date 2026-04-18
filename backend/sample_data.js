/**
 * Comprehensive Sample Dataset Generator
 * 200+ Reviews across 3+ product categories
 * Includes noisy data, mixed sentiment, multilingual, and spam examples
 */

const sampleReviews = [
  // ===== SMARTPHONE CATEGORY =====
  // High Quality Reviews
  "Amazing phone! Great camera and very fast processor. Highly recommended!",
  "Excellent product, delivered on time. Battery lasts all day!",
  "Love this phone! Screen quality is outstanding. Worth every penny.",
  "Best purchase ever. Performance is smooth and smooth. Camera is incredible.",
  "Perfect! Had high expectations and it exceeded all of them. 5 stars!",
  "Superb quality. The display is crisp and colors are vibrant. Loving it!",
  "Fantastic device! Works flawlessly. Recommend to everyone.",
  "Phone arrived in perfect condition. Very satisfied with the purchase.",
  "Brilliant! Build quality is premium. Feels great in hand.",
  "Absolutely amazing! Fast shipping and excellent product quality.",

  // Mixed Sentiment Reviews
  "Great phone but delivery took too long. Product is good though.",
  "Good camera but battery drains fast. Otherwise, decent phone.",
  "Nice design but gets hot during gaming. Quality is okay.",
  "Fast processor but heating issue after update. Mixed experience.",
  "Excellent specs but expensive compared to competitors.",
  "Good performance but screen scratches easily. Disappointed.",
  "Nice features but customer support was unhelpful initially.",
  "Decent phone but not worth the price. Delivery was late too.",
  "Product quality is great but packaging was damaged.",
  "Good device but some features not work as expected.",

  // Negative Reviews
  "Phone broke after 2 weeks. Very disappointed!",
  "Battery is terrible. Barely lasts 4 hours.",
  "Delivery was delayed by 10 days! Unacceptable.",
  "Poor quality. Camera doesn't focus properly.",
  "Waste of money. Phone heats up constantly.",
  "Screen stopped working after one month.",
  "Overheating problem. Same issue from day 1.",
  "Build quality is poor. Feels cheap!",
  "Customer service refund process is horrible.",
  "Defective unit received. Replacement also has issues.",
  "Delivery delay of 20 days! Cancelled order.",
  "Phone freezes repeatedly. Complete disaster!",
  "Battery drains in 2 hours. Totally useless.",
  "Display cracks easily. Poor manufacturing quality.",
  "Return process is a nightmare. Very frustrated.",

  // Hinglish/Multilingual Reviews
  "Bahut mast phone! Camera ekdum superb. Highly recommend karo!",
  "Phone bilkul amazing hai. Battery life ekdum best!",
  "Bahut delayed delivery tha but product quality mast hai.",
  "Bekaar phone! Bilkul kharab. Money waste.",
  "Thik thak phone, kaafi slow tha initially lekin ab theek hai.",
  "Delivery der tha par product awesome hai. Satisfied!",
  "Battery life ekdum kharab. Bahut frustrating!",
  "Phone bilkul slow. Camera quality bhi ghatia hai.",
  "Mast quality, super fast delivery. Ekdum mast!",
  "Overheating bahut problem. Bilkul waste.",

  // Noisy/Typo Reviews
  "Amazin fone! Grt camera amd vry fast prcosor.",
  "Excelent product, delivrd on time. Battry is greet!",
  "Loveee this phne! Scren qualityyy is outstanding!!!",
  "Best purcahse evr. Performence is smoth and smooth.",
  "Perfct! Had high expectatins and it surpased all!!!",
  "Bad phone. Very laggy. Extreemly slow.",
  "Phone brok after 2 weeks. Dissapointed!!!!!",
  "Delievery toooo late! Unacceptble.",
  "Gabage product. Complete wastee of mony!",
  "Scren stoped working. Terribel quality.",

  // Short Reviews
  "Good!",
  "Bad!",
  "Amazing!",
  "Terrible!",
  "Okay.",
  "Excellent",
  "Awful",
  "Nice",
  "Poor",
  "Great",

  // ===== LAPTOP CATEGORY =====
  // High Quality
  "Outstanding laptop! Perfect for programming and design work.",
  "Excellent performance. Runs all my software smoothly.",
  "Best laptop I've owned. Keyboard comfort is exceptional.",
  "Fast processing, great display, and battery lasts 8 hours.",
  "Premium build quality. Worth the investment.",
  "Amazing productivity machine. CPU is incredibly fast.",
  "Fantastic! No lag whatsoever. Recommended for professionals.",
  "Great value. Performance is outstanding for the price.",
  "Beautiful display and smooth performance. Very happy!",
  "Excellent customer support. Laptop is fantastic too!",

  // Mixed
  "Good laptop but runs hot during intensive tasks.",
  "Great performance but Wi-Fi connectivity issues sometimes.",
  "Nice design but trackpad feels cheap.",
  "Good processing power but screen brightness is inadequate.",
  "Excellent specs but keyboard feels mushy.",
  "Good laptop but customer support took long to respond.",
  "Decent performance but battery unexpectedly low.",
  "Nice device but comes with bloatware. Disappointed.",
  "Good speed but fan noise is irritating.",
  "Great for work but gaming experience is average.",

  // Negative
  "Laptop crashed multiple times. Very unreliable.",
  "Overheating issue! Fans are constantly loud.",
  "Screen flickering after one month. Defective!",
  "Battery died after 3 months. Terrible quality.",
  "Delivery was a nightmare. Took 30 days!",
  "Poor build quality. Chassis cracked during shipping.",
  "Customer service refused warranty claim.",
  "Laptop freezes constantly. Very frustrating!",
  "Screen quality is terrible. Cannot use for design.",
  "Keyboard malfunction after 2 months. Poor durability.",

  // Hinglish
  "Bahut badhiya laptop! Kaam karne ke liye ekdum perfect.",
  "Performance ekdum mast! Bahut fast.",
  "Lagta nahi ki itni price mein itna acha laptop milega.",
  "Bahut heated hota hai. Fan noise bahut zyada.",
  "Bekaar laptop. Bahut slow aur heating problem.",
  "Delivery bahut der. Bilkul irritating waali experience.",

  // Noisy
  "Outstaning compooter! Perfct for programing.",
  "Excelent perfomance. Ruuns all my softwre smothly.",
  "Bst laptop ive ownd. Keybord comfrt is exeptional!!!",
  "Bad laptoop. Ruuns hot alll the time.",
  "Screan flickering!!! Defective unit obvviously.",

  // ===== HEADPHONES CATEGORY =====
  // High Quality
  "Incredible sound quality! Bass is perfect.",
  "Best headphones I've bought. Noise cancellation is amazing.",
  "Comfort is excellent. Can wear for hours without fatigue.",
  "Sound clarity is outstanding. Highly recommended!",
  "Great battery life. Lasts 30 hours on single charge.",
  "Surround sound is immense. Feels like a concert!",
  "Build quality is premium. Look and feel money!",
  "Excellent wireless range. Connection is stable.",
  "Best investment for music lovers. Worth every rupee.",
  "Perfect for gaming and movies. Audio is crisp!",

  // Mixed
  "Good sound but uncomfortable for long sessions.",
  "Great audio but wireless connection drops occasionally.",
  "Nice design but battery life is average.",
  "Good bass but treble feels excessive at times.",
  "Comfort is good but noise cancellation is weak.",
  "Decent headphones but microphone quality is poor.",
  "Good for music but not ideal for calls.",
  "Nice sound but padded area gets uncomfortable.",
  "Good quality but price is on the higher side.",
  "Decent product but right ear speaker died after 4 months.",

  // Negative
  "Sound quality is terrible! Very disappointed.",
  "Battery dies after 2 hours. Completely useless!",
  "Noise cancellation doesn't work at all.",
  "Headphones broke after one month! Poor quality.",
  "Uncomfortable. Causes ear pain after 10 minutes.",
  "Wireless connection keeps dropping. Unreliable.",
  "Sound cuts out randomly. Very frustrating!",
  "Right speaker stopped working. Complete waste.",
  "Delivery was late by 2 weeks!",
  "Refund process was a complete nightmare.",

  // Hinglish
  "Bahut accha sound quality! Bass ekdum mast.",
  "Noise cancellation bilkul awesome. Ekdum silent!",
  "Comfort bahut zyada. Pura din pehen sakte hain.",
  "Bekaar headphones. Sound quality kharab hai.",
  "Bilkul useless. Battery 2 hours ke baad dead!",

  // Noisy
  "Incrideble soud quality! Bas is prefect.",
  "Bst headfones ive bough. Noisee cancelation is amazin!!!",
  "Terible sound qualitee! Vry dissapointed.",
  "Batery dies after 2 hurs. Compleetly useless!!!",

  // ===== SMART WATCH CATEGORY =====
  // High Quality
  "Amazing smartwatch! All features work perfectly.",
  "Battery lasts 5 days. Very reliable and accurate.",
  "Heart rate monitor is very accurate. Love it!",
  "Great fitness tracking. Very motivated to exercise now.",
  "Display is bright and responsive. Excellent device.",
  "Water resistant and durable. Perfect for outdoor activities!",
  "Sleep tracking is accurate. Helps me sleep better.",
  "Fast performance. Syncs instantly with phone.",
  "Best smartwatch in this price range!",
  "Loving the design. Looks premium and feels solid!",

  // Mixed
  "Good watch but battery drains faster than expected.",
  "Nice features but learning curve is steep.",
  "Good tracker but accuracy sometimes questionable.",
  "Display is nice but screen gets smudged easily.",
  "Good performance but app is resource heavy.",
  "Nice design but metal band causes skin irritation.",
  "Good features but customer support is slow.",
  "Decent watch but fitness tracking not accurate enough.",
  "Good but syncing issues sometimes.",
  "Nice product but price is quite high.",

  // Negative
  "Screen went dead after 2 weeks!",
  "Heart rate monitor is completely inaccurate!",
  "Battery lasts only 12 hours. Terrible!",
  "Watch broke after one month of use.",
  "Sync issues with phone. Very frustrating!",
  "Fitness tracking is useless. Numbers don't match reality.",
  "Delivery was damaged. Cracked screen on arrival!",
  "Build quality is poor. Band broke easily.",
  "Customer service is non-existent. No support!",
  "Worst purchase ever. Total waste of money!",

  // Hinglish
  "Bahut accha smartwatch! Sab features work perfectly.",
  "Battery ekdum shukriya lagegi. 5 din chalti hai!",
  "Heart rate monitor bilkul accurate hai. Bahut happy!",
  "Bekaar smartwatch. Screen dead ho gaya ek mahine mein.",
  "Display bilkul kharab. Bahut irritating.",

  // Noisy
  "Amazin smartwatc! All featurees work perfctly!!!",
  "Batery last 5 dayz. Vry reliable amd acurate.",
  "Hert rate moniter is compleetly inacurate!!!!",
  "Waatch brok after 1 month of use.",

  // ===== BUDGET/OUTLIER REVIEWS =====
  "zzzzzzzzzzz horrible horrible horrible waste waste waste",
  "GOOOOOOD GOOOOOOD GOOOOOOD BEST BEST BEST",
  "This product is very very very very very very very very good good good good",
  "http://spam.com buy now http://spam.com don't miss out",
  "Click here for discount! Limited offer! Act now!",
  "same exact wonderful amazing excellent review exact same",
  "love it love it love it love it love it love it love it",
  "terrible awful bad bad bad bad bad bad",
  "Click here: https://spam1.com or https://spam2.com for deals",
  "ABSOLUTELY COMPLETELY TERRIBLE WORST WORST WORST HORRIBLE",

  // Additional varied reviews
  "Mast product hai! Delivery bahut jaldi ho gaya.",
  "Good quality but paisa thoda zyada. Negotiable nahi?",
  "Excellent experience. Will order again soon!",
  "Poor packaging. Item was damaged upon arrival.",
  "Best price in market. Great value for money.",
  "Not as described in listing. Got different color.",
  "Arrived early! Quality exceeded expectations.",
  "Customer service was helpful and responsive.",
  "Product broke on first use. No replacement.",
  "Exactly what I wanted. Perfect choice!",
  "Defective item. Refund process was slow.",
  "Impressive quality. Recommended to friends.",
  "Disappointed. Not worth the hype.",
  "Amazing! Exceeded all my expectations.",
  "Okay product. Nothing special really.",
  "Terrible experience. Won't buy again.",
  "Fantastic! Best in its category.",
  "Average quality. Expected better.",
  "Outstanding service and product.",
  "Worst purchase decision ever made.",

  // ===== TABLET CATEGORY =====
  // High Quality
  "Excellent tablet! Perfect for reading and streaming content.",
  "Great display quality. Colors are vibrant and sharp.",
  "Outstanding performance for multitasking and gaming.",
  "Amazing battery life. Lasts an entire week!",
  "Very responsive touchscreen. Navigation is smooth.",
  "Great device for productivity and entertainment combined.",
  "Brilliant screen resolution. Perfect for graphic design work.",
  "Fast processor handles everything I throw at it.",
  "Tablet is lightweight and portable. Love carrying it around!",
  "Excellent value for money. Highly recommended!",

  // Mixed
  "Good tablet but speakers could be louder.",
  "Great display but processor gets hot while gaming.",
  "Nice tablet but charging port is loose.",
  "Good performance overall but occasional lag.",
  "Nice design but screen gets fingerprints easily.",
  "Good tablet but stylus sold separately.",
  "Great features but software updates are slow.",
  "Decent tablet but doesn't hold charge as advertised.",
  "Good but WiFi connectivity drops sometimes.",
  "Nice tablet but heavier than competitors.",

  // Negative
  "Tablet crashed constantly. Complete disaster!",
  "Display stopped working after 3 months.",
  "Touchscreen is unresponsive and frustrating.",
  "Battery drains extremely fast.",
  "Very slow performance. Can't even play videos smoothly.",
  "Arrived damaged. Screen has cracks.",
  "WiFi doesn't work properly. Always disconnects.",
  "Storage is much less than specified.",
  "Heating issue during normal usage.",
  "Worst tablet purchase ever. Would not recommend.",

  // ===== CLOTHING/FASHION CATEGORY =====
  // High Quality
  "Perfect fit! Very comfortable and stylish.",
  "Excellent quality fabric. Feels premium!",
  "Great design. Looks exactly like the picture.",
  "Color is vibrant and fading resistant.",
  "Comfortable to wear all day. Perfect fit!",
  "Material quality is superb. Worth every penny.",
  "Love the design. Gets compliments all the time!",
  "Stitching is perfect. Very well made.",
  "Fits true to size. Very satisfied!",
  "Excellent quality for the price. Highly recommend!",

  // Mixed
  "Good quality but size runs a bit small.",
  "Nice design but color is slightly different than picture.",
  "Great fit but material pilled after first wash.",
  "Comfortable but shrinks after washing.",
  "Good quality but delivery took longer than expected.",
  "Nice shirt but seams came loose after few washes.",
  "Good fit but elastic lost shape quickly.",
  "Nice color but fades after a few washes.",
  "Good quality but sizing is inconsistent.",
  "Comfortable but not worth the price charged.",

  // Negative
  "Terrible quality! Fell apart after one wash.",
  "Size was completely wrong. Doesn't fit at all.",
  "Color fades immediately after first wash.",
  "Material is cheap and uncomfortable.",
  "Stitching came undone after wearing once.",
  "Fabric is see-through. False advertising!",
  "Smells bad even after washing.",
  "Material is very itchy. Can't wear it.",
  "Wrong color delivered. Picture is misleading.",
  "Worst clothing purchase ever. Returning immediately.",

  // ===== HOME APPLIANCES CATEGORY =====
  // High Quality
  "Excellent kitchen appliance. Makes cooking easier!",
  "Great performance. Very durable and reliable.",
  "Perfect size for my kitchen. Easy to use.",
  "Very efficient. Reduces cooking time significantly.",
  "Outstanding quality. Built to last years!",
  "Operation is smooth and quiet. Very impressive!",
  "Easy to clean. Great design and functionality.",
  "Very user-friendly. Great value for money.",
  "Excellent energy efficiency. Low power consumption.",
  "Best appliance I ever bought. Highly satisfied!",

  // Mixed
  "Good appliance but noise level is a bit high.",
  "Works well but cleaning is quite tedious.",
  "Good performance but takes up too much space.",
  "Efficient but operation manual is confusing.",
  "Good quality but some features are complicated.",
  "Works well but heats up during extended use.",
  "Decent appliance but warranty support is lacking.",
  "Good but replacement parts are expensive.",
  "Works fine but doesn't match kitchen decor.",
  "Good functionality but delivery was damaged.",

  // Negative
  "Appliance stopped working after 2 months.",
  "Very noisy operation. Unacceptable noise level!",
  "Doesn't work as advertised. False claims!",
  "Broke during installation. Not sturdy at all.",
  "Power consumption is very high. Expensive to run.",
  "Heating issues. Catches heat easily.",
  "Quality is poor. Looks cheep and flimsy.",
  "Motor burned out after few uses.",
  "Service support is non-existent.",
  "Total waste of money. Would not recommend.",

  // ===== FURNITURE CATEGORY =====
  // High Quality
  "Excellent furniture! Assembly was easy.",
  "Great quality. Very sturdy and durable.",
  "Perfect for my home. Looks amazing!",
  "Very comfortable and well-built.",
  "Love the design. Complements my home perfectly.",
  "Excellent value. Much better than expected.",
  "Very spacious. Great construction quality.",
  "Delivered on time. Exactly as pictured.",
  "Best furniture purchase ever made!",
  "Perfect condition. Very satisfied with quality!",

  // Mixed
  "Good furniture but assembly took too long.",
  "Nice design but fabric is already pilling.",
  "Good quality but slightly different color than shown.",
  "Comfortable but not as spacious as advertised.",
  "Good price but wood veneer is peeling.",
  "Nice piece but delivery was late.",
  "Good build quality but bolts rusted quickly.",
  "Decent furniture but wobbles when sat on.",
  "Good looking but not very durable.",
  "Okay furniture but not worth the high price.",

  // Negative
  "Furniture arrived broken. Multiple cracks!",
  "Very cheap quality. Fell apart after a month.",
  "Not sturdy at all. Wobbles constantly.",
  "Delivery was damaged. Can't use it now.",
  "Assembly instructions were wrong and confusing.",
  "Wood splits easily. Very poor quality!",
  "Worst furniture ever. Returned immediately.",
  "Fake leather peeling off immediately.",
  "Drawers don't align properly.",
  "Should have bought from quality furniture store.",

  // ===== BEAUTY/SKINCARE CATEGORY =====
  // High Quality
  "Amazing skincare product! Skin looks radiant!",
  "Noticeable results in just one week.",
  "Very effective. My acne has cleared significantly.",
  "Love this product! Skin feels so soft and smooth.",
  "Great quality ingredients. Cruelty-free and organic.",
  "Affordable and very effective. Best buy!",
  "No side effects. Gentle on sensitive skin.",
  "Excellent results. Skin texture has improved greatly.",
  "Worth every penny. Highly recommend to everyone!",
  "Best beauty product I've used. Amazing results!",

  // Mixed
  "Good product but packaging could be better.",
  "Works okay but takes time to see results.",
  "Good ingredients but scent is too strong.",
  "Effective but caused slight irritation initially.",
  "Nice product but gave me minor rash.",
  "Good results but very expensive.",
  "Decent quality but didn't work for my skin type.",
  "Good reviews but didn't work for me personally.",
  "Decent product but too greasy for day use.",
  "Okay results but didn't meet my expectations.",

  // Negative
  "Terrible product! Caused severe skin reaction!",
  "Complete waste of money. No visible results.",
  "My skin condition worsened after using this.",
  "Gave me rash and itching. Returned immediately.",
  "Fake product received. Doesn't match description.",
  "Quality is poor. Package was already opened.",
  "Not effective at all. Totally useless.",
  "Caused breakouts instead of clearing skin.",
  "False advertising. Ingredients don't match label.",
  "Worst skincare product I've ever used!",

  // ===== BOOKS/MEDIA CATEGORY =====
  // High Quality
  "Excellent book! Couldn't put it down.",
  "Great story. Highly engaging and enjoyable read.",
  "Perfect condition. Print quality is excellent.",
  "Author did amazing research. Very informative!",
  "Best book I've read this year. Highly recommended!",
  "Captivating narrative. Character development is superb.",
  "Great value. Very well written and edited.",
  "Thought-provoking content. Makes you think deeply.",
  "Delivered in perfect condition. Very happy!",
  "Perfect book selection. Exactly what I was looking for!",

  // Mixed
  "Good book but pacing was a bit slow.",
  "Interesting story but ending was predictable.",
  "Well-written but some chapters felt unnecessary.",
  "Great premise but execution could be better.",
  "Enjoyed it but too long. Could be shorter.",
  "Good book but paperback quality is subpar.",
  "Interesting read but dialogue felt forced.",
  "Good story but character development lacking.",
  "Decent read but not as good as expected.",
  "Okay book but overrated according to reviews.",

  // Negative
  "Book arrived damaged with bent pages.",
  "Poor printing quality. Text is blurry.",
  "Boring story from beginning to end.",
  "Waste of money. Couldn't get past first chapter.",
  "Bad translation. Difficult to understand.",
  "Poor editing quality. Many typos throughout.",
  "Not recommended. Completely disappointing read.",
  "Worst book I've ever read. Would rate zero stars.",
  "Arrived with pages missing. Unacceptable!",
  "Content is terrible. Story makes no sense.",

  // More realistic reviews
  "been using for 3 weeks now and very impressed with quality",
  "good product but shipping took longer than expected",
  "decent quality for the price point, would recommend",
  "not satisfied with purchase, quality is below average",
  "excellent product and fast delivery, very satisfied",
  "okay product but had to contact support multiple times",
  "purchase was hassle free and product is great",
  "disappointed with quality, bought from competitor instead",
  "love this product, using it daily, very reliable",
  "waste of money, return process was nightmare",
  "perfect product, exactly as described",
  "quality issues, but customer service fixed it",
  "amazing experience from ordering to delivery",
  "product stopped working after 2 weeks",
  "great value, will buy again for sure",
];

/**
 * Generate a comprehensive review dataset
 */
function generateSampleDataset() {
  return sampleReviews.map((text, index) => ({
    id: `review_${index + 1}`,
    text,
    category: getCategoryForReview(text),
    createdAt: new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));
}

/**
 * Categorize reviews
 */
function getCategoryForReview(text) {
  const lowerText = text.toLowerCase();

  // Priority-based detection (check specific first, then general)

  // TABLET: iPads, Android tablets, 2-in-1 devices (check before screen/monitor)
  if (
    lowerText.includes("tablet") ||
    lowerText.includes("ipad") ||
    (lowerText.includes("stylus") && !lowerText.includes("headphone")) ||
    (lowerText.includes("drawing") && lowerText.includes("display"))
  ) {
    return "tablet";
  }

  // SMARTWATCH: wearables, fitness trackers (check before "watch")
  if (
    (lowerText.includes("smartwatch") && lowerText.includes("heart")) ||
    (lowerText.includes("fitness") && lowerText.includes("track")) ||
    (lowerText.includes("heart rate") && !lowerText.includes("phone")) ||
    (lowerText.includes("workout") && lowerText.includes("track")) ||
    (lowerText.includes("band") && lowerText.includes("fitness"))
  ) {
    return "smartwatch";
  }

  // SMARTPHONE: mobile phones (high priority)
  if (
    lowerText.includes("phone") ||
    (lowerText.includes("camera") && lowerText.includes("phone")) ||
    (lowerText.includes("processor") && lowerText.includes("phone")) ||
    (lowerText.includes("battery") && lowerText.includes("phone")) ||
    lowerText.includes("mobile") ||
    lowerText.includes("cellular") ||
    (lowerText.includes("sim card") && !lowerText.includes("laptop"))
  ) {
    return "smartphone";
  }

  // HEADPHONES: audio devices, earbuds (check "speaker" carefully)
  if (
    lowerText.includes("headphone") ||
    lowerText.includes("earphone") ||
    lowerText.includes("earbud") ||
    (lowerText.includes("sound") && lowerText.includes("quality")) ||
    (lowerText.includes("audio") && lowerText.includes("quality")) ||
    (lowerText.includes("speaker") && lowerText.includes("quality")) ||
    (lowerText.includes("bass") && lowerText.includes("sound")) ||
    (lowerText.includes("noise cancel") && !lowerText.includes("phone"))
  ) {
    return "headphones";
  }

  // LAPTOP: computers, desktops (check before generic terms)
  if (
    lowerText.includes("laptop") ||
    lowerText.includes("notebook") ||
    (lowerText.includes("keyboard") && !lowerText.includes("furniture")) ||
    (lowerText.includes("monitor") && lowerText.includes("cpu")) ||
    (lowerText.includes("monitor") && lowerText.includes("ram")) ||
    (lowerText.includes("cpu") && lowerText.includes("performance")) ||
    (lowerText.includes("ram") && lowerText.includes("storage")) ||
    (lowerText.includes("ssd") && lowerText.includes("storage")) ||
    (lowerText.includes("workstation") && lowerText.includes("computer"))
  ) {
    return "laptop";
  }

  // FURNITURE: chairs, tables, beds, sofas
  if (
    lowerText.includes("furniture") ||
    (lowerText.includes("chair") && !lowerText.includes("beach")) ||
    (lowerText.includes("table") && !lowerText.includes("turn")) ||
    (lowerText.includes("bed") && !lowerText.includes("bedroom")) ||
    lowerText.includes("sofa") ||
    lowerText.includes("couch") ||
    (lowerText.includes("assembly") && lowerText.includes("furniture")) ||
    (lowerText.includes("spacious") && lowerText.includes("furniture")) ||
    (lowerText.includes("comfortable") && lowerText.includes("furniture"))
  ) {
    return "furniture";
  }

  // CLOTHING: apparel, fashion, textiles
  if (
    lowerText.includes("clothes") ||
    lowerText.includes("dress") ||
    lowerText.includes("shirt") ||
    lowerText.includes("pants") ||
    (lowerText.includes("fabric") && !lowerText.includes("appliance")) ||
    (lowerText.includes("fit") && lowerText.includes("size")) ||
    (lowerText.includes("cotton") && !lowerText.includes("furniture")) ||
    (lowerText.includes("stitch") && lowerText.includes("quality")) ||
    (lowerText.includes("color") && lowerText.includes("fade")) ||
    lowerText.includes("seamless")
  ) {
    return "clothing";
  }

  // HOME APPLIANCES: kitchen appliances, small appliances
  if (
    lowerText.includes("appliance") ||
    (lowerText.includes("kitchen") && lowerText.includes("appliance")) ||
    (lowerText.includes("microwave") && !lowerText.includes("phone")) ||
    (lowerText.includes("oven") && !lowerText.includes("laptop")) ||
    (lowerText.includes("blender") && !lowerText.includes("phone")) ||
    (lowerText.includes("mixer") && lowerText.includes("cooking")) ||
    (lowerText.includes("cooking") && lowerText.includes("appliance")) ||
    (lowerText.includes("energy efficient") &&
      lowerText.includes("appliance")) ||
    (lowerText.includes("heating") && lowerText.includes("appliance"))
  ) {
    return "home_appliances";
  }

  // BEAUTY/SKINCARE: cosmetics, skincare, personal care
  if (
    lowerText.includes("skincare") ||
    lowerText.includes("beauty") ||
    (lowerText.includes("skin") && !lowerText.includes("phone")) ||
    (lowerText.includes("acne") && lowerText.includes("product")) ||
    (lowerText.includes("facial") && lowerText.includes("product")) ||
    (lowerText.includes("moistur") && !lowerText.includes("phone")) ||
    (lowerText.includes("cream") && !lowerText.includes("phone")) ||
    (lowerText.includes("organic") && lowerText.includes("ingredient")) ||
    (lowerText.includes("ingredient") && lowerText.includes("skin")) ||
    (lowerText.includes("rash") && lowerText.includes("product")) ||
    (lowerText.includes("sensitive") && lowerText.includes("skin"))
  ) {
    return "beauty";
  }

  // BOOKS/MEDIA: books, magazines, digital media
  if (
    lowerText.includes("book") ||
    (lowerText.includes("story") && lowerText.includes("great")) ||
    (lowerText.includes("author") && lowerText.includes("writing")) ||
    (lowerText.includes("chapter") && lowerText.includes("book")) ||
    (lowerText.includes("edit") && lowerText.includes("book")) ||
    (lowerText.includes("narrative") && lowerText.includes("book")) ||
    (lowerText.includes("character") && lowerText.includes("book")) ||
    (lowerText.includes("page") && lowerText.includes("quality"))
  ) {
    return "books";
  }

  return "general";
}

/**
 * Get dataset statistics
 */
function getDatasetStats() {
  const reviews = generateSampleDataset();
  const categories = {};

  reviews.forEach((review) => {
    const category = review.category;
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category]++;
  });

  return {
    totalReviews: reviews.length,
    categories,
    dateRange: {
      from: reviews[reviews.length - 1].createdAt,
      to: reviews[0].createdAt,
    },
  };
}

module.exports = {
  sampleReviews,
  generateSampleDataset,
  getCategoryForReview,
  getDatasetStats,
};
