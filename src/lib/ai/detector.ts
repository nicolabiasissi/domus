import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai && process.env.OPENAI_API_KEY) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

/**
 * AI Detector: Uses GPT-4o to judge if an email subject/body represents a bill/invoice.
 */
export async function detectBill(subject: string, body: string): Promise<{ isBill: boolean; confidence: number }> {
    const openai = getOpenAI();

    if (!openai) {
        // Fallback or Dev mode: simple keyword check if key is missing
        const keywords = ["bolletta", "fattura", "invoice", "bill", "pagamento"];
        const isBill = keywords.some(k => subject.toLowerCase().includes(k) || body.toLowerCase().includes(k));
        return { isBill, confidence: isBill ? 0.8 : 0.1 };
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are an expert financial assistant. Identify if the following email details represent a utility bill, rent invoice, or house expense." },
            { role: "user", content: `Subject: ${subject}\n\nBody: ${body}\n\nIs this a bill? Respond in JSON: { "isBill": boolean, "confidence": number }` }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
        isBill: result.isBill || false,
        confidence: result.confidence || 0,
    };
}
