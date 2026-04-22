import { useAppContext } from "@/context/AppContext";

export function useCurrency() {
    const { user } = useAppContext();
    const currency = user?.currency || "EUR";
    const language = user?.language || "it";

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat(language === "it" ? "it-IT" : "en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    return { formatAmount, currency };
}
