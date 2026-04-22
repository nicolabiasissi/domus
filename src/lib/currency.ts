export function formatCurrency(amount: number, currency: string = "EUR", lang: string = "it"): string {
    return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-US", {
        style: "currency",
        currency: currency,
    }).format(amount);
}
