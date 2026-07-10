import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // ログイン時に実行される処理
    async signIn({ account, profile }) {
      if (account?.provider === "discord" && profile?.id) {
        const discordId = profile.id as string;
        const username = profile.username as string;
        const displayName = (profile.global_name || profile.username) as string;
        const avatarUrl = profile.image_url as string | null;

        // 1. ユーザーがDBに存在するかチェック
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.discordId, discordId))
          .limit(1);

        if (existingUser.length === 0) {
          // 2-a. 新規ユーザーの場合：DBに登録
          const isAdmin = discordId === process.env.INITIAL_ADMIN_DISCORD_ID;
          await db.insert(users).values({
            discordId,
            username,
            displayName,
            avatarUrl,
            role: isAdmin ? "ADMIN" : "USER",
          });
        } else {
          // 2-b. 既存ユーザーの場合：名前やアイコンの変更を同期
          await db
            .update(users)
            .set({
              username,
              displayName,
              avatarUrl,
            })
            .where(eq(users.id, existingUser[0].id));
        }
      }
      return true; // ログインを許可
    },
    // JWTトークン生成時に実行される処理
    async jwt({ token, profile }) {
      // signIn直後はprofileが入ってくるので、DBから最新情報を引いてtokenに詰める
      if (profile?.id) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.discordId, profile.id as string))
          .limit(1);
        if (existingUser.length > 0) {
          token.dbUserId = existingUser[0].id;
          token.role = existingUser[0].role;
        }
      }
      return token;
    },
    // クライアント(ブラウザ)にセッションを渡す時の処理
    async session({ session, token }) {
      if (token.dbUserId) {
        session.user.id = token.dbUserId as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});
