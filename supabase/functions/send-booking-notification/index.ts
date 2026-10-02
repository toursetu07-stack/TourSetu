import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const oneSignalAppId = "1d58b571-868b-4b5b-b370-cd417cac6c28";
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
    const requestOrigin = req.headers.get("origin") || "";
    const appUrl = (Deno.env.get("TOURSETU_APP_URL") || requestOrigin || "https://toursetu.in").replace(/\/$/, "");

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !oneSignalRestApiKey) {
      console.error("Missing notification function secrets/config");
      return json({ error: "Notification service is not configured." }, 500);
    }

    // Validate the caller's Supabase session before using the service-role client.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const callerId = userData.user.id;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const bookingId = String(body?.booking_id || "");
    const bookingType = String(body?.booking_type || "").toLowerCase();

    if (!bookingId || !["agency", "hotel"].includes(bookingType)) {
      return json({ error: "booking_id and booking_type are required" }, 400);
    }

    let targetUserId = "";
    let title = "";
    let message = "";
    let url = appUrl;

    if (bookingType === "agency") {
      const { data: booking, error } = await admin
        .from("bookings")
        .select("id, customer_id, customer_email, customer_phone, travel_date, total_price, package_title, agency_id")
        .eq("id", bookingId)
        .single();

      if (error || !booking) return json({ error: "Booking not found" }, 404);
      if (String(booking.customer_id) !== callerId) return json({ error: "Forbidden" }, 403);
      if (!booking.agency_id) return json({ error: "Agency recipient not found" }, 422);

      targetUserId = String(booking.agency_id);
      title = "🔔 New Booking Request";
      message = `A customer has sent you a new booking request for ${booking.package_title || "your tour package"}.`;
      url = `${appUrl}?notification=booking&booking_type=agency&booking_id=${encodeURIComponent(booking.id)}`;
    } else {
      const { data: booking, error } = await admin
        .from("hotel_bookings")
        .select("id, customer_id, hotel_name, room_type, check_in_date, check_out_date, rooms_booked, total_amount, room_category_id")
        .eq("id", bookingId)
        .single();

      if (error || !booking) return json({ error: "Hotel booking not found" }, 404);
      if (String(booking.customer_id) !== callerId) return json({ error: "Forbidden" }, 403);
      if (!booking.room_category_id) return json({ error: "Hotel room category not found" }, 422);

      const { data: category, error: categoryError } = await admin
        .from("room_categories")
        .select("hotel_id")
        .eq("id", booking.room_category_id)
        .single();

      if (categoryError || !category?.hotel_id) return json({ error: "Hotel recipient not found" }, 422);

      const { data: hotel, error: hotelError } = await admin
        .from("hotels")
        .select("owner_id, hotel_name")
        .eq("hotel_id", category.hotel_id)
        .single();

      if (hotelError || !hotel?.owner_id) return json({ error: "Hotel owner recipient not found" }, 422);

      targetUserId = String(hotel.owner_id);
      title = "🏨 New Hotel Booking Request";
      message = `A customer has requested ${booking.rooms_booked || 1} room(s) at ${booking.hotel_name || hotel.hotel_name || "your hotel"}.`;
      url = `${appUrl}?notification=booking&booking_type=hotel&booking_id=${encodeURIComponent(booking.id)}`;
    }

    const oneSignalResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${oneSignalRestApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_aliases: { external_id: [targetUserId] },
        target_channel: "push",
        headings: { en: title },
        contents: { en: message },
        web_url: url,
        data: {
          type: "booking_request",
          booking_type: bookingType,
          booking_id: bookingId,
        },
      }),
    });

    const oneSignalData = await oneSignalResponse.json().catch(() => ({}));

    if (!oneSignalResponse.ok) {
      console.error("OneSignal API error:", oneSignalResponse.status, oneSignalData);
      return json({ error: "Push provider rejected the notification.", details: oneSignalData }, 502);
    }

    return json({
      success: true,
      target_user_id: targetUserId,
      notification_id: oneSignalData?.id || null,
      delivered_to_subscriber: Boolean(oneSignalData?.id),
    });
  } catch (error) {
    console.error("send-booking-notification error:", error);
    return json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
