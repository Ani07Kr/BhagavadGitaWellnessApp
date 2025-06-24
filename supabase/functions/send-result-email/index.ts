import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { name, email, result } = await req.json();

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Mental App <noreply@yourdomain.com>",
      to: email,
      subject: "Your Test Result",
      html: `<h2>Hi ${name},</h2><p>Your result is: <strong>${result}</strong></p>`,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    return new Response(error, { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
