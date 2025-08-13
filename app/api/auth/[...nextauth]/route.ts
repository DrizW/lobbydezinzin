import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

const handler = NextAuth({
  ...authOptions,
  events: {
    async signIn({ user, isNewUser }) {
      await recordAudit({ userId: user?.id as string, action: isNewUser ? "auth.signin.new" : "auth.signin" });
    },
    async signOut({ token }) {
      await recordAudit({ userId: token?.sub as string, action: "auth.signout" });
    },
  },
});

export { handler as GET, handler as POST };
