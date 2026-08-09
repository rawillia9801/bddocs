import { captureDocumentOrder, documentOffering, getDocumentOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function parseReference(value: string | undefined) {
  const match = /^user:([0-9a-f-]{36});offer:(document-single|document-packet);template:([a-z0-9-]+)$/i.exec(value || "");
  return match ? { userId: match[1], offeringKey: match[2], templateId: match[3] } : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return Response.json({ error: "Log in to complete this purchase." }, { status: 401 });
  try {
    const body = await request.json() as { order_id?: string };
    const orderId = String(body.order_id || "");
    const existing = await getDocumentOrder(orderId);
    const reference = parseReference(existing.purchase_units?.[0]?.custom_id);
    if (!reference || reference.userId !== userId) return Response.json({ error: "This order does not belong to the signed-in account." }, { status: 403 });
    const offering = documentOffering(reference.offeringKey);
    if (!offering) return Response.json({ error: "Unknown document purchase." }, { status: 409 });
    const captured = existing.status === "COMPLETED" ? existing : await captureDocumentOrder(orderId);
    if (String(captured.status).toUpperCase() !== "COMPLETED") return Response.json({ error: `PayPal returned ${captured.status || "UNKNOWN"}.` }, { status: 409 });
    const capture = captured.purchase_units?.[0]?.payments?.captures?.[0];
    const admin = createAdminClient();
    const { error } = await admin.from("dogdocs_purchases").upsert({
      user_id: userId,
      product_type: offering.productType,
      template_id: offering.productType === "single" ? reference.templateId : null,
      amount_cents: Math.round(Number(offering.price) * 100),
      payment_status: "paid",
      provider_reference: capture?.id || captured.id,
    }, { onConflict: "provider_reference" });
    if (error) throw error;
    return Response.json({ captured: true, orderId: captured.id, offering: offering.key, templateId: reference.templateId, status: "COMPLETED" }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to capture PayPal order." }, { status: 502 });
  }
}
