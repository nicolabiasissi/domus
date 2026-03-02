import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { User, Sliders, CreditCard, HelpCircle } from "lucide-react";

const settingsTabs = [
    { href: "/settings/profile", label: "Profilo", icon: User, desc: "Nome, avatar, documento identità" },
    { href: "/settings/preferences", label: "Preferenze", icon: Sliders, desc: "Tema, lingua, notifiche" },
    { href: "/settings/account", label: "Account", icon: CreditCard, desc: "Piano, email, abbonamento" },
    { href: "/settings/support", label: "Supporto", icon: HelpCircle, desc: "Help, contatti, link utili" },
];

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Impostazioni</h1>
                    <p className="page-subtitle">Gestisci il tuo account e le preferenze</p>
                </div>
            </div>
            <div className="settings-grid">
                {settingsTabs.map(({ href, label, icon: Icon, desc }) => (
                    <Link key={href} href={href} className="settings-card">
                        <div className="settings-card-icon">
                            <Icon size={22} />
                        </div>
                        <div>
                            <div className="settings-card-title">{label}</div>
                            <div className="settings-card-desc">{desc}</div>
                        </div>
                        <span className="settings-card-arrow">→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
