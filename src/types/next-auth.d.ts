import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            plan?: "BASIC" | "PRO";
            theme?: "LIGHT" | "DARK" | "AUTO";
            firstName?: string | null;
            lastName?: string | null;
        };
    }

    interface User {
        plan?: "BASIC" | "PRO";
        theme?: "LIGHT" | "DARK" | "AUTO";
        firstName?: string | null;
        lastName?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        plan?: "BASIC" | "PRO";
        theme?: "LIGHT" | "DARK" | "AUTO";
        firstName?: string | null;
        lastName?: string | null;
    }
}
