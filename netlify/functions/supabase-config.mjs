export default async function handler() {
  const url = process.env.SUPABASE_URL || '';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !publishableKey) {
    return new Response(
      'TourSetu Supabase runtime configuration is not configured.',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const config = JSON.stringify({
    url,
    publishableKey
  });

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
