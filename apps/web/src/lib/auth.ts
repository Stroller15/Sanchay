import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SignJWT } from "jose";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
        sub: token.sub,
        email: token.email,
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
