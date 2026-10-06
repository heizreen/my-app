import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth's own endpoints (/api/auth/session, /api/auth/callback/..., etc.)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
