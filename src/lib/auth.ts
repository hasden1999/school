import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser } from "@/types";
import * as React from "react";

const safeCache = typeof React.cache === "function" ? React.cache : <T extends (...args: any[]) => any>(fn: T): T => fn;

export const SESSION_COOKIE_NAME = "school_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 Days Secure Session

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "school_saas_iraq_jwt_default_secret_key_2025_secure";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a secure JWT session token
 */
export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    tenantId: user.tenantId,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    jobTitle: user.jobTitle || null,
    permissionsJson: user.permissionsJson || null,
    isCustomPermissions: !!user.isCustomPermissions,
    phone: user.phone || null,
    mustChangePassword: !!user.mustChangePassword,
    schoolName: user.schoolName || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecretKey());
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });

    if (!payload?.id || !payload?.role) {
      return null;
    }

    return {
      id: payload.id as string,
      tenantId: payload.tenantId as string,
      username: payload.username as string,
      fullName: payload.fullName as string,
      role: payload.role as any,
      jobTitle: (payload.jobTitle as string) || null,
      permissionsJson: (payload.permissionsJson as string) || null,
      isCustomPermissions: !!payload.isCustomPermissions,
      phone: (payload.phone as string) || null,
      mustChangePassword: !!payload.mustChangePassword,
      schoolName: (payload.schoolName as string) || undefined,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Cached getSession() using React cache & cryptographically verified JWT
 */
export const getSession = safeCache(async (): Promise<SessionUser | null> => {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
});

export async function setSession(user: SessionUser) {
  const cookieStore = cookies();
  const token = await signSessionToken(user);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: string[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (allowedRoles) {
    // If user is SUPER_ADMIN, always allowed
    if (session.role === "SUPER_ADMIN") {
      return session;
    }

    // For school staff roles, if allowedRoles includes "ADMIN", allow administrative roles
    const adminRoles = ["ADMIN", "VICE_PRINCIPAL", "ACCOUNTANT", "STAFF", "SUPERVISOR", "CUSTOM"];
    const isAllowed =
      allowedRoles.includes(session.role) ||
      (allowedRoles.includes("ADMIN") && adminRoles.includes(session.role));

    if (!isAllowed) {
      redirect("/login");
    }
  }

  return session;
}
