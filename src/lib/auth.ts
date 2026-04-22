import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !user.password) return null;

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) return null;

                // Sync name for NextAuth compatibility
                const displayName = (user as any).firstName && (user as any).lastName
                    ? `${(user as any).firstName} ${(user as any).lastName}`
                    : (user.name || user.email);

                return {
                    id: user.id,
                    email: user.email,
                    name: displayName,
                    firstName: (user as any).firstName,
                    lastName: (user as any).lastName,
                    plan: user.plan as any,
                    theme: user.theme as any,
                    avatarUrl: user.avatarUrl
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.plan = (user as any).plan;
                token.theme = (user as any).theme;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
                (session.user as any).plan = token.plan;
                (session.user as any).theme = token.theme;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
});
