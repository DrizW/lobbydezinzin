import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import speakeasy from "speakeasy";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Tentative de connexion pour:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Email ou mot de passe manquant");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("👤 Utilisateur trouvé:", user ? "OUI" : "NON");
        if (user) {
          console.log("🔑 Mot de passe en base:", user.password ? "PRÉSENT" : "ABSENT");
        }

        if (!user || !user.password) {
          console.log("❌ Utilisateur non trouvé ou pas de mot de passe");
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔍 Comparaison mot de passe:", isValid ? "CORRECT" : "INCORRECT");

        if (!isValid) {
          console.log("❌ Mot de passe incorrect");
          return null;
        }

        // 2FA: si activée, exige un code OTP valide dans les credentials
        if (user.twoFactorEnabled) {
          const otp = (credentials as any)?.otp as string | undefined;
          if (!otp || !speakeasy.totp.verify({ secret: user.twoFactorSecret || "", encoding: "base32", token: otp, window: 1 })) {
            console.log("❌ 2FA requise ou code invalide");
            return null;
          }
        }

        console.log("✅ Connexion réussie pour:", user.email);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
};