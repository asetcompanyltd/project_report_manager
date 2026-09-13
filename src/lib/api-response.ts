import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Wraps a route handler body, converting thrown ApiError/ZodError into the standard error shape. */
export async function withApiErrors<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return ok(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return errorResponse(err.status, err.code, err.message);
    }
    if (err instanceof ZodError) {
      return errorResponse(400, "VALIDATION_ERROR", err.issues.map((i) => i.message).join("; "));
    }
    console.error(err);
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong.");
  }
}
