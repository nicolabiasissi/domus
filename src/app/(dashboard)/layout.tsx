import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    return (
        <div className="dashboard-root">
            <Sidebar />
            <div className="dashboard-main">
                <Header />
                <main className="dashboard-content">{children}</main>
            </div>
        </div>
    );
}
