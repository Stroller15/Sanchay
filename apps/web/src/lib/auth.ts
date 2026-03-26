import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SignJWT } from "jose";

const isDev = process.env.NODE_ENV === "development";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(isDev
      ? [
          CredentialsProvider({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "test@example.com" },
              password: { label: "Password (any)", type: "password" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              return {
                id: `dev-${credentials.email}`,
                email: credentials.email,
                name: credentials.email.split("@")[0] ?? null,
              };
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.providerId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      session.accessToken = await new SignJWT({
        sub: token.sub ?? session.user.id,
        email: token.email ?? undefined,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .setIssuedAt()
        .sign(secret);
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
