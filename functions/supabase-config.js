export async function onRequestGet({ env }) {
  const url = env.SUPABASE_URL || '';
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !publishableKey) {
    return new Response(
      'TourSetu Supabase runtime configuration is not configured.',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }

  const config = JSON.stringify({ url, publishableKey });

  return new Response(
    `window.__TOURSETU_SUPABASE_CONFIG__ = ${config};`,
    {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}
