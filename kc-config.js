// Supabase project settings are public client configuration, not administrator
// passwords. Row Level Security in supabase/schema.sql protects private data.
export const KC_SUPABASE_URL = 'https://avawxzfjocqibntihgrf.supabase.co';
export const KC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_S0AXEBcK2L-Ci_JL1fCUhQ_STe-oLcK';

export const kcBackendConfigured = Boolean(KC_SUPABASE_URL && KC_SUPABASE_PUBLISHABLE_KEY);
