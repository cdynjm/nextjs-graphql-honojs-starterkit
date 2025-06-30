import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db/mongodb";
import { User } from "./db/models/user";
import { Role } from "./db/models/role";
import bcrypt from "bcrypt";
import { signJwt } from "./jwt";
import { generateKey, encrypt } from "./crypto";
import { User as UserCollection } from "@/types/user";
import { Role as RoleCollection } from "@/types/role";

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

        await connectToDatabase();

        const user = (await User.findOne({
          email: credentials.email,
        }).populate("role")
        .lean()) as unknown as UserCollection | null;
        if (!user || typeof user.password !== "string") return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role?._id.toString(),
          roleName: user.role?.name,
          created_at: user.created_at || new Date(0),
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
    maxAge: 60 * 120,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.roleName = user.roleName;
        token.created_at = user.created_at;
        token.accessToken = process.env.NEXTAUTH_ACCESSTOKEN || "";
      } else if (token?.id) {
        await connectToDatabase();
        const updatedUser = (await User.findById(token.id).lean()) as {
          name: string;
          email: string;
          role?: string;
          created_at?: Date;
        } | null;

        const updatedRole = (await Role.findById(
          token.role
        ).lean()) as unknown as RoleCollection | null;

        if (updatedUser) {
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.roleName =
            updatedRole && updatedRole.name !== undefined
              ? String(updatedRole.name)
              : "";
          token.role =
            updatedUser.role !== undefined ? String(updatedUser.role) : "";
          token.created_at = updatedUser.created_at || new Date(0);
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
        session.user.role = token.role as string;
        session.user.roleName = token.roleName as string;
        session.user.created_at = token.created_at as Date;
        session.token = token.accessToken as string;

        function omit<T extends Record<string, unknown>, K extends keyof T>(
          obj: T,
          keys: K[]
        ): Omit<T, K> {
          const clone = { ...obj };
          for (const key of keys) {
            delete clone[key];
          }
          return clone;
        }

        session.bearer = signJwt(omit(token, ["exp", "iat", "jti"]));
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
