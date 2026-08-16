import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in * 1000),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        if (account.refresh_token) {
          console.log('\n\n=== IMPORTANT: YOUR REFRESH TOKEN ===');
          console.log(account.refresh_token);
          console.log('Copy this token and add it to your Vercel Environment Variables as GOOGLE_REFRESH_TOKEN');
          console.log('=====================================\n\n');
        }
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (Number(account.expires_in) || 3600) * 1000,
          refreshToken: account.refresh_token,
        };
      }
      
      // Return previous token if the access token has not expired yet
      // If we don't have accessTokenExpires (old sessions), we'll assume it's expired to force a refresh
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      
      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.error = token.error;
      return session;
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
