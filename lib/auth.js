import "server-only";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "./users";

// Browsers share cookies between every app on localhost, whatever the port.
// Giving this app its own cookie names stops it clashing with another
// NextAuth app running on the same machine.
function cookie(name) {
  return {
    name: `movie-browser.${name}`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export const authOptions = {
  // Keeps the login in a signed cookie, so no database is needed for sessions
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: cookie("session-token"),
    callbackUrl: cookie("callback-url"),
    csrfToken: cookie("csrf-token"),
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: { email: {}, password: {} },
      // Called on every login attempt. Returning null means "wrong details".
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return verifyUser(
          credentials.email.trim().toLowerCase(),
          credentials.password
        );
      },
    }),
  ],
};

// For Server Components: the logged-in user ({ name, email }), or null
export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
