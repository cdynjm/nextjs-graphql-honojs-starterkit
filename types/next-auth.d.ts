// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: number;
      created_at: Date;
      updated_at: Date;
    } & DefaultSession["user"];
    token: string;
    bearer: string;
  }

  interface User extends DefaultUser {
    role: number;
    created_at: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: number;
    accessToken: string;
    created_at: Date;
  }
}
