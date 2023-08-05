import { NextResponse } from "next/server";
import { type UserRole } from "@/types";
import { clerkClient } from "@clerk/nextjs";
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // 認証無しで接続可能なりURL
  publicRoutes: ["/signin(.*)", "/signup(.*)", "/sso-callback(.*)", "/api(.*)"],

  async afterAuth(auth, req) {
    // 接続先が認証無しで接続可能なURLであれば、そのまま接続を許可する
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // 接続先が認証必要なURLであれば、認証情報を確認し、認証がなければ、サインインページにリダイレクトする
    if (!auth.userId) {
      //  If user tries to access a private route without being authenticated,
      //  redirect them to the sign in page
      const url = new URL(req.nextUrl.origin);
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    // 認証情報を取得し、ユーザーが存在しなければエラーを投げる
    const user = await clerkClient.users.getUser(auth.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    // ユーザーは存在するが、ロールが設定されていなければ、ロールを設定する。
    if (!user.privateMetadata.role) {
      await clerkClient.users.updateUserMetadata(auth.userId, {
        privateMetadata: {
          role: "user" satisfies UserRole,
        },
      });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};
