import { createClient } from "@supabase/supabase-js";

// The URL and the publishable key are designed to be public (they ship in the
// browser). Real protection comes from the row-level security rules in
// supabase/setup.sql. Never put a secret / service_role key in this project.
const url =
  import.meta.env.VITE_SUPABASE_URL || "https://kvjpvbspjzohvejawank.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_VbwNPuhYCuVMkKwDycJ8VQ_SaihlZex";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
