import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import speakeasy from "speakeasy";
import { rateLimit } from "@/lib/rateLimit";
import { recordAudit } from "@/lib/audit";

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
        totp: { label: "Code 2FA", type: "text" },
        captchaToken: { label: "Captcha", type: "text" },
      },
      async authorize(credentials, req) {
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

        // Rate limit par email + IP (si disponible)
        try {
          const ipHeader = (req as any)?.headers?.get?.("x-forwarded-for") || (req as any)?.headers?.get?.("x-real-ip") || "";
          const ip = Array.isArray(ipHeader) ? ipHeader[0] : String(ipHeader || "").split(",")[0].trim();
          const rl = rateLimit({ key: `login:${credentials.email}:${ip}`, windowMs: 15 * 60 * 1000, max: 10 });
          if (!rl.allowed) {
            await recordAudit({ userId: user?.id, action: "auth.signin.rate_limited", details: { email: credentials.email } });
            throw new Error("RATE_LIMITED");
          }
        } catch {}

        // Captcha (Turnstile) optionnel si secret présent
        try {
          const secret = process.env.TURNSTILE_SECRET;
          const response = (credentials as any)?.captchaToken as string | undefined;
          if (secret && response) {
            const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ secret, response }),
            });
            const data = await verify.json();
            if (!data.success) {
              await recordAudit({ userId: user?.id, action: "auth.signin.captcha_failed" });
              throw new Error("CAPTCHA_FAILED");
            }
          }
        } catch (e) {
          if (e instanceof Error && (e.message === "CAPTCHA_FAILED" || e.message === "RATE_LIMITED")) {
            throw e;
          }
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔍 Comparaison mot de passe:", isValid ? "CORRECT" : "INCORRECT");

        if (!isValid) {
          console.log("❌ Mot de passe incorrect");
          try { await recordAudit({ userId: user.id, action: "auth.signin.failed", details: { reason: "bad_password" } }); } catch {}
          return null;
        }

        // 2FA enforcement si activée
        if (user.twoFactorEnabled) {
          const token = (credentials as any)?.totp as string | undefined;
          const ok = token && user.twoFactorSecret
            ? speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token, window: 1 })
            : false;
          if (!ok) {
            console.log("❌ 2FA requise ou code invalide");
            try { await recordAudit({ userId: user.id, action: "auth.signin.2fa_failed" }); } catch {}
            throw new Error("TWO_FACTOR_REQUIRED");
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