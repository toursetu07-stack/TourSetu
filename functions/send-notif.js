export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // 1. Get the data from your website
        const body = await request.json();
        const { targetUserId, messageTitle, messageBody } = body;
        
        const appId = "1d58b571-868b-4b5b-b370-cd417cac6c28";
        
        // 2. Pull the secret key from your Cloudflare Environment Variables
        const apiKey = env.ONESIGNAL_REST_KEY; 

        // 3. Safety check: If the key is missing in Cloudflare, show a clear error
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
                "Authorization": `Basic ${apiKey.trim()}` // .trim() removes any accidental spaces
            },
            body: JSON.stringify({
                app_id: appId,
                include_external_user_ids: [targetUserId],
                headings: { "en": messageTitle },
                contents: { "en": messageBody },
                url: "https://toursetu.pages.dev" 
            })
        });

        const result = await response.json();

        // 5. Return the result back to your script.js
        return new Response(JSON.stringify({
            status: response.status,
            onesignalResponse: result,
            sentTo: targetUserId
        }), {
            headers: { "Content-Type": "application/json" },
            status: response.status
        });

    } catch (err) {
        // If something crashes, return the error message
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
