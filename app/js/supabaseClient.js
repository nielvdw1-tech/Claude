// VDW Compliance Control System - Supabase configuration & client
//
// Fill in these two values from your Supabase project dashboard
// (Project Settings > API): "Project URL" and "anon public" key.
// The anon key is safe to expose in client-side code - Row Level
// Security policies (see /supabase/policies.sql) control what data
// each user can actually read or write.
window.SUPABASE_CONFIG = {
  url: 'https://YOUR-PROJECT-REF.supabase.co',
  anonKey: 'YOUR-ANON-PUBLIC-KEY'
};

if (window.supabase) {
  window.sb = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
} else {
  // The supabase-js CDN script failed to load (offline / blocked network).
  // Fall back to a stub client so the app degrades gracefully instead of
  // throwing on startup.
  console.error('Supabase client library failed to load - check network access to the CDN.');
  const notConfigured = { message: 'Supabase client library failed to load (check network/CDN access).' };
  const chain = {
    select: () => chain, insert: () => chain, update: () => chain, delete: () => chain,
    eq: () => chain, single: () => chain, order: () => chain,
    then: (resolve) => resolve({ data: null, error: notConfigured })
  };
  window.sb = {
    from: () => chain,
    auth: {
      signInWithPassword: () => Promise.resolve({ data: {}, error: notConfigured }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null } })
    }
  };
}
