type Translations = {
    [key: string]: {
        [lang: string]: string;
    }
};

const translations: Translations = {
    "dashboard": { it: "Dashboard", en: "Dashboard" },
    "properties": { it: "Immobili", en: "Properties" },
    "expenses": { it: "Spese", en: "Expenses" },
    "inbox": { it: "AI Inbox", en: "AI Inbox" },
    "settings": { it: "Impostazioni", en: "Settings" },
    "welcome": { it: "Ciao", en: "Hello" },
    "total_year": { it: "Totale anno", en: "Year total" },
    "unpaid": { it: "Da pagare", en: "Unpaid" },
    "overdue": { it: "Arretrate", en: "Overdue" },
    "month_expenses": { it: "Spese del mese", en: "Month expenses" },
    // Add more as needed
};

export function t(key: string, lang: string = "it"): string {
    return translations[key]?.[lang] || translations[key]?.["it"] || key;
}
