// supabase.js
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://fiiudqjenjticgprqkwn.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaXVkcWplbmp0aWNncHJxa3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTM0MjksImV4cCI6MjA3MTQ2OTQyOX0.fWRkgBV2_GrLr3xY0EWz55F-7dAqUD75MPNiofmBjKE";

// ✅ Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
