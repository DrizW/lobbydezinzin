import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
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
        
        console.log("✅ Connexion réussie pour:", user.email);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Rediriger vers le dashboard après connexion réussie
      if (url.startsWith(baseUrl)) return url;
      // Permettre les redirections externes si nécessaire
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 