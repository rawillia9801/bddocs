import { randomUUID } from "node:crypto";

export type DocumentOffering = {
  key: "document-single" | "document-packet";
  name: string;
  description: string;
  price: string;
  productType: "single" | "packet";
};

export const documentOfferings: readonly DocumentOffering[] = [
  { key: "document-single", name: "DogBreederDocs — One Editable Form", description: "One selected breeder document, saved to the purchaser's account for unlimited editing and reuse.", price: "9.99", productType: "single" },
  { key: "document-packet", name: "DogBreederDocs — Complete Breeder Packet", description: "The complete DogBreederDocs library, saved to the purchaser's account for unlimited editing and reuse.", price: "29.95", productType: "packet" },
] as const;

type PayPalLink = { href?: string; rel?: string };
export type PayPalOrder = {
  id: string;
  status?: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payments?: { captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }> };
  }>;
};

let tokenCache: { value: string; expiresAt: number } | null = null;

function environment() {
  return process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase() === "sandbox" ? "sandbox" : "live";
}

function apiBase() {
  return environment() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
}

function required(name: "PAYPAL_CLIENT_ID" | "PAYPAL_CLIENT_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`PayPal checkout is not configured. Add ${name} to the bddocs Vercel environment.`);
  return value;
}

async function accessToken(force = false) {
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.value;
  const credentials = Buffer.from(`${required("PAYPAL_CLIENT_ID")}:${required("PAYPAL_CLIENT_SECRET")}`).toString("base64");
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${credentials}`, "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { access_token?: string; expires_in?: number; error_description?: string } | null;
  if (!response.ok || !payload?.access_token) throw new Error(payload?.error_description || "PayPal authentication failed.");
  tokenCache = { value: payload.access_token, expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 300)) * 1000 };
  return tokenCache.value;
}

async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const run = async (token: string) => {
    const headers = new Headers(init.headers);
    headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");
    if (init.body) headers.set("content-type", "application/json");
    const response = await fetch(`${apiBase()}${path}`, { ...init, headers, cache: "no-store" });
    const payload = await response.json().catch(() => null) as T & { message?: string; details?: Array<{ description?: string }> } | null;
    return { response, payload };
  };
  let result = await run(await accessToken());
  if (result.response.status === 401) { tokenCache = null; result = await run(await accessToken(true)); }
  if (!result.response.ok) {
    const detail = result.payload?.details?.find(item => item.description)?.description;
    throw new Error(detail || result.payload?.message || `PayPal returned ${result.response.status}.`);
  }
  return result.payload as T;
}

export function documentOffering(key: string) {
  return documentOfferings.find(offering => offering.key === key) || null;
}

export async function createDocumentOrder(input: { offering: DocumentOffering; userId: string; templateId?: string; returnUrl: string; cancelUrl: string }) {
  const templateId = input.offering.productType === "single" ? String(input.templateId || "") : "packet";
  if (input.offering.productType === "single" && !/^[a-z0-9-]{2,80}$/i.test(templateId)) throw new Error("Select a document before checkout.");
  const customId = `user:${input.userId};offer:${input.offering.key};template:${templateId}`;
  const order = await paypalRequest<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    headers: { "paypal-request-id": `dogbreederdocs-order-${randomUUID()}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: customId,
        description: input.offering.description,
        amount: { currency_code: "USD", value: input.offering.price, breakdown: { item_total: { currency_code: "USD", value: input.offering.price } } },
        items: [{ name: input.offering.name, description: input.offering.description, quantity: "1", unit_amount: { currency_code: "USD", value: input.offering.price }, category: "DIGITAL_GOODS" }],
      }],
      application_context: { brand_name: "DogBreederDocs.online", user_action: "PAY_NOW", return_url: input.returnUrl, cancel_url: input.cancelUrl },
    }),
  });
  const approvalUrl = order.links?.find(link => link.rel === "approve")?.href;
  if (!order.id || !approvalUrl) throw new Error("PayPal did not return an approval link.");
  return { orderId: order.id, approvalUrl };
}

export async function getDocumentOrder(orderId: string) {
  if (!/^[A-Z0-9]+$/i.test(orderId)) throw new Error("Invalid PayPal order ID.");
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`);
}

export async function captureDocumentOrder(orderId: string) {
  if (!/^[A-Z0-9]+$/i.test(orderId)) throw new Error("Invalid PayPal order ID.");
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: "POST", headers: { "paypal-request-id": `dogbreederdocs-capture-${orderId}` }, body: "{}" });
}
