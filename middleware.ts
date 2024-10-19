import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  try {
    // Extract the requested path
    const { pathname } = request.nextUrl;

    // Allow access to the root path without authentication
    if (pathname === "/") {
      return NextResponse.next();
    }

    // Allow access to static assets and specific paths
    if (
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpeg") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".webp") ||
      pathname.endsWith(".gif") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".mp4") ||
      pathname === "/favicon.ico" || // Ignore favicon
      pathname === "/manifest.json" || // Ignore Next.js static assets
      pathname.startsWith("/api") || // Ignore Next.js static assets
      pathname.startsWith("/worker") || // Ignore Next.js static assets
      pathname.startsWith("/workbox") || // Ignore Next.js static assets
      pathname.startsWith("/_next") ||
      pathname.startsWith("/icons") || // Ignore Next.js static assets
      pathname === "/sw.js" || // Ignore service worker
      pathname === "/sw.map"
    ) {
      return NextResponse.next();
    }

    // Extract the cookies from the request headers
    const cookiesHeader = request.headers.get("cookie");
    const privyToken = cookiesHeader
      ? cookiesHeader
          .split("; ")
          .find((cookie) => cookie.startsWith("privy-token="))
          ?.split("=")[1]
      : null;

    if (!privyToken) {
      // Redirect to root (login page) if not authenticated
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Decode the JWT (use your JWT secret here)
    const decoded = jwt.decode(privyToken) as { sub: string };
    if (!decoded || !decoded.sub) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const outsideId = decoded.sub;

    // Call an API route that uses Prisma to check if the user exists and has completed onboarding
    const res = await fetch(`${request.nextUrl.origin}/api/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outsideId }),
    });

    const user = await res.json();
    console.log("middleWare", user);
    console.log("Using DATABASE_URL:", process.env.DATABASE_URL);

    // Redirect to onboarding if user is authenticated but hasn't completed onboarding
    if (!user || !user.isComplete) {
      if (pathname.startsWith("/onboarding")) {
        return NextResponse.next(); // Allow access to onboarding if not complete
      }
      return NextResponse.redirect(new URL("/onboarding/step1", request.url));
    }

    // Allow access to the requested page if user is authenticated and complete
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
