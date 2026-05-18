import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "fr", "ar", "es"];
const DEFAULT = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const hasLocale = LOCALES.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  if (hasLocale) return NextResponse.next();

  // Redirect to default locale
  const url = new URL(`/${DEFAULT}${pathname === "/" ? "/feed" : pathname}`, request.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts).*)",
  ],
};
