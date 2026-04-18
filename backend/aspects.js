const fs = require('fs');
const path = require('path');

const aspectsFilePath = path.join(__dirname, 'learned_aspects.json');

const baseAspects = {
    product: ['product', 'item', 'quality', 'built', 'material', 'design', 'phone', 'device', 'battery', 'camera'],
    delivery: ['delivery', 'shipping', 'packaging', 'arrived', 'received', 'late', 'fast', 'delay', 'shipment', 'courier', 'dispatch'],
    price: ['price', 'cost', 'expensive', 'cheap', 'value', 'money', 'affordable', 'budget', 'costly'],
    service: ['service', 'support', 'staff', 'customer', 'response', 'refund', 'return', 'help']
};

const phraseMappings = {
    "too costly": "price",
    "too expensive": "price",
    "took too long": "delivery",
    "never arrived": "delivery",
    "arrived broken": "delivery",
    "waste of money": "price",
    "worth every penny": "price",
    "bad behavior": "service",
    "no reply": "service"
};

let learnedAspects = {};
if (fs.existsSync(aspectsFilePath)) {
    try { learnedAspects = JSON.parse(fs.readFileSync(aspectsFilePath, 'utf8')); } 
    catch(e) { learnedAspects = {}; }
}
function saveLearnedAspects() { fs.writeFileSync(aspectsFilePath, JSON.stringify(learnedAspects, null, 2)); }
function mergeAspects() { return { ...baseAspects, ...learnedAspects }; }

function extractClauses(text) {
    const clauses = text.split(/[,.;!?]|\b(but|and|although|however|though|yet|also|even though|despite that|while|whereas)\b/i);
    const stopSplit = ['but','and','although','however','though','yet','also','even though','despite that','while','whereas'];
    return clauses.map(c => c && c.trim()).filter(c => c && c.length > 2 && !stopSplit.includes(c.toLowerCase()));
}

function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for(let i = 1; i <= b.length; i++){
        for(let j = 1; j <= a.length; j++){
            if(b.charAt(i-1) === a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
            else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, Math.min(matrix[i][j-1]+1, matrix[i-1][j]+1));
        }
    }
    return matrix[b.length][a.length];
}

function isFuzzyMatch(word, keyword, maxDistance = 2) {
    if (word.includes(keyword) || keyword.includes(word)) return true;
    return getLevenshteinDistance(word, keyword) <= maxDistance;
}

const unmappedFrequency = {};
const AUTO_LEARN_THRESHOLD = 3;

function processAspects(clause) {
    const combinedAspects = mergeAspects();
    const clauseLower = clause.toLowerCase();
    
    const detectedAspects = new Set();
    const unmatchedWords = [];
    
    for (const [phrase, aspect] of Object.entries(phraseMappings)) {
        if (clauseLower.includes(phrase)) detectedAspects.add(aspect);
    }
    
    const words = clauseLower.split(/\W+/).filter(w => w.length > 2);
    
    for (const word of words) {
        let matched = false;
        for (const [aspectName, keywords] of Object.entries(combinedAspects)) {
            const hasKeyword = keywords.some(kw => {
                const maxDist = kw.length <= 4 ? 0 : (kw.length <= 6 ? 1 : 2);
                return isFuzzyMatch(word, kw, maxDist);
            });
            if (hasKeyword) {
                detectedAspects.add(aspectName);
                matched = true;
                break;
            }
        }
        if (!matched && !detectedAspects.size) unmatchedWords.push(word);
    }
    
    return { aspectNames: Array.from(detectedAspects), unmatchedWords };
}

function learnNewAspect(word) {
    const stopwords = ['the', 'this', 'that', 'with', 'from', 'your', 'have', 'very', 'much', 'for', 'are', 'was', 'not', 'you', 'too'];
    if (stopwords.includes(word) || word.length < 4) return;
    if (!unmappedFrequency[word]) unmappedFrequency[word] = 0;
    unmappedFrequency[word]++;
    if (unmappedFrequency[word] >= AUTO_LEARN_THRESHOLD) {
        if (!learnedAspects[word] && !Object.values(baseAspects).flat().includes(word)) {
            learnedAspects[word] = [word];
            saveLearnedAspects();
            console.log(`[Auto-Learn] New aspect discovered -> saved to JSON: ${word}`);
        }
    }
}
module.exports = { extractClauses, processAspects, learnNewAspect };
