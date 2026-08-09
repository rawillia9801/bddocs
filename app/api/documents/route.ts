import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase connection pending" }, { status: 503 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data, error } = await supabase.from("dogdocs_documents").select("id,title,template_id,state,updated_at").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load documents" }, { status: 500 });
  return NextResponse.json({ documents: data });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase connection pending" }, { status: 503 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  if (!body?.title || !body?.templateId || !body?.state) return NextResponse.json({ error: "Missing document fields" }, { status: 400 });
  const { data, error } = await supabase.from("dogdocs_documents").insert({
    user_id: userId, title: String(body.title).slice(0, 160), template_id: String(body.templateId).slice(0, 80), state: String(body.state).slice(0, 40),
    header_content: String(body.header ?? ""), body_content: String(body.body ?? ""), footer_content: String(body.footer ?? ""), clauses: body.clauses ?? [], logo_data: body.logo ?? null, status: "draft",
  }).select("id,title,status,updated_at").single();
  if (error) return NextResponse.json({ error: "Unable to save document" }, { status: 500 });
  return NextResponse.json({ document: data }, { status: 201 });
}
