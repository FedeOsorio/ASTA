import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      orgId: string
      industry: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    orgId: string
    industry: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    orgId: string
    industry: string
    role: string
  }
}