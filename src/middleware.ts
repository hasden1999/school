import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "school_session";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "school_saas_iraq_jwt_default_secret_key_2025_secure";
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifyToken(sessionCookie) : null;

  // 1. If accessing login while already authenticated with a valid session:
  if (pathname === "/login" && session?.role) {
    const role = session.role as string;
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }
    const adminRoles = ["ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF", "SUPERVISOR", "CUSTOM"];
    if (adminRoles.includes(role)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    }
    if (role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // 2. Protected route prefixes
  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");

  if (isSuperAdminRoute || isAdminRoute || isTeacherRoute || isStudentRoute) {
    // If not authenticated, redirect to /login
    if (!session || !session.role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) {
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }

    const role = session.role as string;

    // Super Admin can access everything
    if (role === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    // Protect Super Admin portal
    if (isSuperAdminRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect School Admin portal
    if (isAdminRoute) {
      const allowedAdminRoles = ["ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF", "SUPERVISOR", "CUSTOM"];
      if (!allowedAdminRoles.includes(role)) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Protect Teacher portal
    if (isTeacherRoute) {
      if (role !== "TEACHER" && role !== "ADMIN" && role !== "VICE_PRINCIPAL") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Protect Student portal
    if (isStudentRoute) {
      if (role !== "STUDENT" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
  ],
};
