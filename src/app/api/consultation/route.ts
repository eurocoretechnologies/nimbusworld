import { NextResponse } from "next/server";
import { validateConsultation } from "@/lib/consultation";

/**
 * Consultation requests. Delivery is configured by environment:
 *   CONSULTATION_WEBHOOK_URL — receives the validated request as JSON
 *   (a CRM, Google Apps Script, Zapier/Make hook, or an email relay).
 * Without it, development logs the request; production refuses rather than
 * silently dropping a student's enquiry.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { value, errors } = validateConsultation(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, error: "validation", fields: errors }, { status: 422 });
  }

  const payload = { ...value, submittedAt: new Date().toISOString(), source: "nimbusworld-website" };
  const webhook = process.env.CONSULTATION_WEBHOOK_URL;

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[consultation] delivery failed", err);
      return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[consultation] (dev, no CONSULTATION_WEBHOOK_URL set)", payload);
    return NextResponse.json({ ok: true, delivered: false });
  }

  console.error("[consultation] CONSULTATION_WEBHOOK_URL is not configured");
  return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
}
