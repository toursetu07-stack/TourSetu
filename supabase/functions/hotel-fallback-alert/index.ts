import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Legacy Twilio fallback endpoint.
 *
 * This endpoint is intentionally disabled for normal client callers.
 * The previous implementation accepted an arbitrary "to" phone number,
 * which made any authenticated user capable of using TourSetu's Twilio
 * credentials as an SMS relay.
 *
 * Keep this endpoint secret-gated until a server-side booking notification
 * workflow is wired to it. Never accept a client-supplied destination
 * without deriving/authorizing it from a booking on the server.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-toursetu-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const internalSecret = Deno.env.get("TOURSETU_INTERNAL_ALERT_SECRET");
  const suppliedSecret = req.headers.get("x-toursetu-internal-secret");

  // No secret = endpoint intentionally unavailable.
  if (!internalSecret || !suppliedSecret || suppliedSecret !== internalSecret) {
    return json({ error: "Forbidden" }, 403);
  }

  try {
    const { to, hotelName, bookingId } = await req.json();

    if (typeof to !== "string" || !/^\+[1-9]\d{7,14}$/.test(to)) {
      return json({ error: "A valid E.164 destination is required." }, 400);
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return json({ error: "Notification service is not configured." }, 503);
    }

    const safeHotelName = String(hotelName || "Offline").slice(0, 120);
    const safeBookingId = String(bookingId || "Alert").slice(0, 80);
    const bodyText = `Alert: Hotel ${safeHotelName} Booking ${safeBookingId}`;

    const twilioUrl =
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", fromNumber);
    params.append("Body", bodyText);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error("Twilio fallback rejected:", response.status);
      return json({ error: "SMS provider rejected the notification." }, 502);
    }

    const result = await response.json().catch(() => ({}));
    return json({
      success: true,
      message_id: result?.sid || null,
    });
  } catch (error) {
    console.error("hotel-fallback-alert error:", error);
    return json({ error: "Internal notification error." }, 500);
  }
});