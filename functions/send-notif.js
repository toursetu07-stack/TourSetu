export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { targetUserId, messageTitle, messageBody } = await request.json();
        const appId = "1d58b571-868b-4b5b-b370-cd417cac6c28";
        const apiKey = env.ONESIGNAL_REST_KEY; 

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${apiKey}`
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
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
