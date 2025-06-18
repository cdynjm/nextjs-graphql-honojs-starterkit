import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import { generateKey, encrypt } from "./crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const userResult = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, credentials.email))
          .limit(1);

        const user = userResult[0];
        if (!user || typeof user.password !== "string") return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? 0,
          created_at: user.created_at || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 120,
    updateAge: 0,
  },
  jwt: {
    maxAge: 60 * 120, // 2 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.created_at = user.created_at;
        token.accessToken = process.env.NEXTAUTH_ACCESSTOKEN || "";
      } else if (token?.id) {
        const userResult = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, parseInt(token.id)))
          .limit(1);

        const updatedUser = userResult[0];
        if (updatedUser) {
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.role = updatedUser.role ?? 0;
          token.created_at = updatedUser.created_at || "";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const key = await generateKey();
        const encrypted = await encrypt(token.id as string, key);

        session.user.id = encrypted;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as number;
        session.user.created_at = token.created_at as string;
        session.token = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
