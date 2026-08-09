import { createDocumentOrder, documentOffering } from "@/lib/paypal";
import { createClient } from "@/lib/supabase/server";
import { templates } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return Response.json({ error: "Log in before purchasing a document." }, { status: 401 });
  try {
    const body = await request.json() as { offering_key?: string; template_id?: string };
    const offering = documentOffering(String(body.offering_key || ""));
    if (!offering) return Response.json({ error: "Unknown document purchase." }, { status: 400 });
    const templateId = String(body.template_id || "");
    if (offering.productType === "single" && !templates.some(template => template.id === templateId)) return Response.json({ error: "Select a valid document." }, { status: 400 });
    const origin = new URL(request.url).origin;
    const order = await createDocumentOrder({
      offering,
      userId,
      templateId,
      returnUrl: `${origin}/?paypal_capture=1`,
      cancelUrl: `${origin}/?paypal_cancelled=1`,
    });
    return Response.json(order, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to start PayPal checkout." }, { status: 502 });
  }
}
