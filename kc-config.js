// Supabase project settings are public client configuration, not administrator
// passwords. Row Level Security in supabase/schema.sql protects private data.
export const KC_SUPABASE_URL = '';
export const KC_SUPABASE_ANON_KEY = '';

export const kcBackendConfigured = Boolean(KC_SUPABASE_URL && KC_SUPABASE_ANON_KEY);
