import OpenAI from "openai";
import { prisma } from "../prisma";

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai && process.env.OPENAI_API_KEY) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

/**
 * Extracts identity details from a verification bill.
 */
export async function extractIdentity(docId: string, pdfText: string) {
    const openai = getOpenAI();

    if (!openai) {
        // Mock result for dev
        return await updateDoc(docId, {
            extractedName: "Nicolò Biasissi",
            extractedAddress: "Via Roma 123, Milano",
            provider: "Enel Energia",
            contractCode: "123456789",
            status: "VERIFIED"
        });
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Extract name, full address, provider name, and customer/contract code from this bill text." },
            { role: "user", content: pdfText }
        ],
        response_format: { type: "json_object" }
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");

    return await updateDoc(docId, {
        extractedName: data.name,
        extractedAddress: data.address,
        provider: data.provider,
        contractCode: data.contractCode || data.customerCode,
        status: "VERIFIED"
    });
}

async function updateDoc(id: string, data: any) {
    return await prisma.identityDocument.update({
        where: { id },
        data: {
            ...data,
            verifiedAt: new Date()
        }
    });
}
