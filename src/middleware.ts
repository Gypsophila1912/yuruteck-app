import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // 1. ログインしていない場合はログイン画面（API）へ
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
    }
    // 2. ログインしているが管理者ではない場合はトップへ弾く
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // それ以外は通常通り通す
  return NextResponse.next();
});

// Middlewareを適用するパスの条件
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
