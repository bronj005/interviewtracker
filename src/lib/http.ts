import "server-only";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

/** Maps known errors to clean HTTP responses; logs and hides anything unexpected. */
export function handleError(error: unknown) {
  if (error instanceof HttpError) return fail(error.status, error.message);

  if (error instanceof ZodError) {
    return fail(400, error.issues[0]?.message ?? "Invalid request");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return fail(409, "A profile with this name already exists");
      case "P2003":
      case "P2025":
        return fail(404, "Profile not found");
      case "P2024": // connection pool timeout under heavy load
        console.warn("[api] Database connection pool timeout");
        return fail(503, "Server is busy. Please try again.");
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[api] Database unreachable:", error.message);
    return fail(503, "Database is unreachable. Check your connection and try again.");
  }

  console.error("[api] Unexpected error:", error);
  return fail(500, "Something went wrong. Please try again.");
}
