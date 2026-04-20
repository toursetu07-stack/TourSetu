export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // 1. Get the data from your website
        const body = await request.json();
        const { targetUserId, messageTitle, messageBody } = body;
        
        const appId = "1d58b571-868b-4b5b-b370-cd417cac6c28";
        
        // 2. Pull the secret key from your Cloudflare Environment Variables
        const apiKey = env.ONESIGNAL_REST_KEY; 

        // 3. Safety check: If the key is missing in Cloudflare settings, return an error
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: "ONESIGNAL_REST_KEY is not defined in Cloudflare Settings." 
            }), { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 4. Send the notification to OneSignal
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${apiKey.trim()}` // Clean spaces to avoid "Access Denied"
            },
            body: JSON.stringify({
                app_id: appId,
                include_external_user_ids: [targetUserId],
                headings: { "en": messageTitle },
                contents: { "en": messageBody },
                url: "https://toursetu.pages.dev" 
            })
        });

        // Parse the response from OneSignal
        const result = await response.json();

        // 5. Return the full result back to your script.js for logging
        return new Response(JSON.stringify({
            status: response.status,
            success: response.ok,
            onesignalResponse: result,
            sentTo: targetUserId
        }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Helps prevent browser blocks
            },
            status: response.status
        });

    } catch (err) {
        // Catch network or code crashes
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
