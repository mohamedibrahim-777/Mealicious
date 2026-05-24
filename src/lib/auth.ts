import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const isGoogleAuthConfigured = Boolean(googleClientId && googleClientSecret)

export const authOptions: NextAuthOptions = {
  providers: isGoogleAuthConfigured
    ? [
        GoogleProvider({
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
        }),
      ]
    : [],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/#login',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.name = profile.name ?? token.name
        token.email = profile.email ?? token.email
        token.picture = (profile as { picture?: string }).picture ?? token.picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name
        session.user.email = (token.email as string) ?? session.user.email
        session.user.image = (token.picture as string) ?? session.user.image
      }
      return session
    },
  },
}
