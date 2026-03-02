import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai && process.env.OPENAI_API_KEY) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

/**
 * AI Parser: Extracts structured data from bill text (previously extracted from PDF).
 */
export async function parseBill(billText: string) {
    const openai = getOpenAI();

    if (!openai) {
        // MOCK for development
        return {
            amount: 142.50,
            category: "UTILITIES",
            dueDate: "2026-03-20",
            provider: "Enel Energia",
            address: "Via Roma 123",
            description: "Bolletta Luce Gennaio"
        };
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Extract financial data from this bill text. Respond in JSON." },
            { role: "user", content: billText }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
}
