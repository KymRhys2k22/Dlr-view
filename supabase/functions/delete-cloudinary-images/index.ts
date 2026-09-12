import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const authz = req.headers.get("Authorization") ?? ""
  const expectedKey = Deno.env.get("DLR_FUNCTIONS_KEY")
  if (!expectedKey || authz !== `Bearer ${expectedKey}`) {
    return json({ error: "Unauthorized" }, 401)
  }

  const cloud = Deno.env.get("CLOUDINARY_CLOUD_NAME")
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY")
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")
  if (!cloud || !apiKey || !apiSecret) {
    return json({ error: "Cloudinary secrets not configured" }, 500)
  }

  let body: { publicIds?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON body" }, 400)
  }

  const rawIds = Array.isArray(body.publicIds) ? body.publicIds : []
  const publicIds = rawIds
    .map((id) => String(id).trim())
    .filter((id) => id.length > 0 && id.length <= 250)

  if (publicIds.length === 0) {
    return json({ deleted: {}, publicIds: [] })
  }

  const params = new URLSearchParams()
  publicIds.forEach((id) => params.append("public_ids[]", id))

  const url = `https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload?${params.toString()}`
  const basicAuth = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`

  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: basicAuth },
  })

  let data: { deleted?: Record<string, string>; error?: { message?: string } } = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    return json({ error: data.error?.message ?? "Cloudinary delete failed" }, res.status)
  }

  return json({ deleted: data.deleted ?? {} })
})