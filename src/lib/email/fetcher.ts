import { prisma } from "../prisma";
import { detectBill } from "../ai/detector";
import { parseBill } from "../ai/parser";
import { matchProperty } from "../ai/matcher";
import { NotificationService } from "../notifications/service";

/**
 * Main service to process emails and find bills using AI
 */
export async function syncInboxes() {
    console.log("[AI SYNC] Starting global sync...");

    const connections = await prisma.emailConnection.findMany({
        where: { isActive: true },
        include: { user: true }
    });

    for (const conn of connections) {
        try {
            await processInbox(conn);
        } catch (err) {
            console.error(`[AI SYNC] Failed for user ${conn.userId}:`, err);
        }
    }
}

async function processInbox(connection: any) {
    const mockEmailId = `msg_${Date.now()}`;
    const mockEmailSubject = "Nuova Bolletta Enel - Scadenza 20/03/2026";
    const mockEmailBody = "Gentile Cliente, la informiamo che è disponibile la sua bolletta Enel Energia...";

    // 1. DETECT
    const { isBill, confidence } = await detectBill(mockEmailSubject, mockEmailBody);
    if (!isBill) return;

    // 2. DEDUPLICATE
    const existing = await prisma.ingestedEmail.findFirst({
        where: { userId: connection.userId, messageId: mockEmailId }
    });
    if (existing) return;

    // 3. PARSE
    const mockPdfText = "Fornitura Luce - Enel Energia - Cliente: Niki - Indirizzo: Via Roma 123 - Totale: 142.50€ - Scadenza: 2026-03-20";
    const billData = await parseBill(mockPdfText);

    // 4. MATCH
    const property = await matchProperty(billData.address || "", connection.userId);

    // 5. INGEST
    const ingested = await prisma.ingestedEmail.create({
        data: {
            userId: connection.userId,
            messageId: mockEmailId,
            subject: mockEmailSubject,
            body: mockEmailBody,
            fromAddress: "noreply@enel.it",
            receivedAt: new Date(),
            status: property ? "MATCHED" : "PARSED",
            isBill: true,
            confidence,
            rawJson: billData as any,
        }
    });

    // 6. AUTO-CREATE EXPENSE (if property found)
    if (property) {
        await prisma.expense.create({
            data: {
                propertyId: property.id,
                amount: billData.amount,
                category: (billData.category || "UTILITIES") as any,
                description: billData.description || `Bolletta ${billData.provider}`,
                dueDate: billData.dueDate ? new Date(billData.dueDate) : null,
                issuedAt: new Date(),
                isPaid: false,
                source: "AI_EMAIL",
                ingestedEmailId: ingested.id,
            }
        });

        await prisma.ingestedEmail.update({
            where: { id: ingested.id },
            data: { status: "CREATED" }
        });

        // 7. NOTIFY
        await NotificationService.create({
            userId: connection.userId,
            title: "Bolletta registrata!",
            body: `Domus AI ha trovato una bolletta di ${billData.amount}€ per ${property.name}.`,
            type: "BILL_ADDED",
            metadata: { ingestedEmailId: ingested.id }
        });
    } else {
        // Notify of unmatched bill
        await NotificationService.create({
            userId: connection.userId,
            title: "Bolletta non abbinata",
            body: `Abbiamo trovato una bolletta da ${billData.provider} ma non riusciamo ad abbinarla a un immobile.`,
            type: "BILL_DETECTED",
            metadata: { ingestedEmailId: ingested.id }
        });
    }
}
