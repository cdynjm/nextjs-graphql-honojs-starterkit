// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: number;
      created_at: string;
      updated_at: string;
    } & DefaultSession["user"];
    token: string;
  }

  interface User extends DefaultUser {
    role: number;
    created_at: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: number;
    accessToken: string;
    created_at: string
  }
}
