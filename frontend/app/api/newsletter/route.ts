import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function backendBase(): string {
  const api =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
  return api.replace(/\/api\/v1\/?$/, "");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };

  if (typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${backendBase()}/api/v1/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Subscription service rejected the request. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Backend is offline — start it, then try again." },
      { status: 503 },
    );
  }
}
