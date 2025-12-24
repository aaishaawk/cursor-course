import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUser } from "./supabase-server";

// Force the correct URL for NextAuth (prevents Vercel from using preview URLs)
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Fallback for production
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          redirect_uri: `${getBaseUrl()}/api/auth/callback/google`,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Save or update user in Supabase on every sign in
      if (account?.provider === "google" && profile) {
        try {
          await upsertUser({
            google_id: profile.sub as string,
            email: user.email!,
            name: user.name,
            image: user.image,
          });
          console.log("User saved to Supabase:", user.email);
        } catch (error) {
          console.error("Error saving user to Supabase:", error);
          // Don't block sign in if database save fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user id to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and Google ID to the token
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.googleId = profile.sub;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Force redirects to use the correct base URL
      const correctBaseUrl = getBaseUrl();
      if (url.startsWith("/")) {
        return `${correctBaseUrl}${url}`;
      }
      if (url.startsWith(correctBaseUrl)) {
        return url;
      }
      return correctBaseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

