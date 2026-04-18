function generateIntelligence(aspectsMap, rawText) {
    const aspectsList = Object.keys(aspectsMap);
    
    let insights = [];
    let suggestedActions = [];
    let explanation = "";
    let priority = "LOW";
    let impactAnalysis = "";
    
    const rawLower = rawText ? rawText.toLowerCase() : "";
    const strongNegatives = ["terrible", "worst", "awful", "horrible", "disgusting", "useless", "fraud", "scam", "pathetic", "ghatia", "bakwas"];
    let containsStrongNegative = strongNegatives.some(n => rawLower.includes(n));
    
    if (aspectsList.length === 0 || (aspectsList.length === 1 && aspectsList[0] === 'general')) {
        let sent = aspectsMap['general'] ? aspectsMap['general'].sentiment : 'neutral';
        if (containsStrongNegative) sent = 'negative';
        
        if (sent === 'negative') priority = "HIGH";
        
        return {
            overallSentiment: sent,
            overallConfidence: aspectsMap['general'] ? aspectsMap['general'].confidence : 0.8,
            explanation: `Overall sentiment is ${sent} based on general text analysis.`,
            insights: [`General ${sent} sentiment detected.`],
            suggestedActions: ["Continue monitoring general feedback."],
            priority,
            impactAnalysis: sent === 'negative' ? "Negative feedback risks damaging brand reputation." : "Positive feedback reinforces brand trust."
        };
    }
    
    let hasNegative = false;
    let hasPositive = false;
    let negativeAspects = [];
    let positiveAspects = [];
    
    let totalConfidence = 0;
    
    for (const [aspect, data] of Object.entries(aspectsMap)) {
        if (data.sentiment === 'negative' || data.sentiment === 'UNCERTAIN') {
            if(data.sentiment === 'negative') hasNegative = true;
            negativeAspects.push(aspect);
            insights.push(`${aspect.charAt(0).toUpperCase() + aspect.slice(1)} issues are a recurring problem`);
            suggestedActions.push(`Investigate and resolve ${aspect} shortcomings urgently`);
        } else if (data.sentiment === 'positive') {
            hasPositive = true;
            positiveAspects.push(aspect);
            insights.push(`${aspect.charAt(0).toUpperCase() + aspect.slice(1)} quality is consistently praised`);
            suggestedActions.push(`Capitalize on successful ${aspect} strategy`);
        }
        totalConfidence += data.confidence;
    }
    
    const avgConfidence = totalConfidence / aspectsList.length;
    let calculatedOverall = 'neutral';
    
    if (hasNegative || containsStrongNegative) {
        calculatedOverall = 'negative'; // Strong negative logic override dominates
        priority = "HIGH";
        impactAnalysis = `${negativeAspects.join(' and ')} issues may directly reduce future customer retention and invite negative public reviews.`;

        if (hasPositive) {
            explanation = `Overall sentiment is heavily negative because ${negativeAspects.join(' and ')} defects outweigh the positive ${positiveAspects.join(' and ')} feedback.`;
            priority = containsStrongNegative ? "HIGH" : "MEDIUM";
        } else {
            explanation = `Overall sentiment is strictly negative primarily due to critical failures in ${negativeAspects.join(' and ')}.`;
        }
        
    } else if (hasPositive) {
        calculatedOverall = 'positive';
        priority = "LOW";
        explanation = `Overall sentiment is fully positive driven by excellent customer satisfaction across ${positiveAspects.join(' and ')}.`;
        impactAnalysis = `Consistently positive ${positiveAspects.join(' and ')} metrics safely improve brand trust and recurring sales.`;
    } else {
        priority = "LOW";
        explanation = `Overall sentiment is neutral as feedback was unenthusiastic across the board.`;
        impactAnalysis = "Neutral reception creates minimal immediate risk but yields low conversion engagement.";
    }

    insights = [...new Set(insights)];
    suggestedActions = [...new Set(suggestedActions)].slice(0, 3);

    return {
        overallSentiment: calculatedOverall,
        overallConfidence: Math.min(avgConfidence + (containsStrongNegative ? 0.1 : 0), 0.99),
        explanation,
        priority,
        impactAnalysis,
        insights,
        suggestedActions
    };
}
module.exports = { generateIntelligence };
