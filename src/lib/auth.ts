import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { SessionUser } from "@/types";

const SESSION_COOKIE_NAME = "school_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { tenant: true },
    });

    if (!user || !user.active) return null;

    return {
      id: user.id,
      tenantId: user.tenantId,
      username: user.username,
      fullName: user.fullName,
      role: user.role as any,
      phone: user.phone,
      mustChangePassword: user.mustChangePassword,
      schoolName: user.tenant?.name,
    };
  } catch (err) {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = cookies();
  const serialized = Buffer.from(JSON.stringify(user)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, serialized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: string[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
