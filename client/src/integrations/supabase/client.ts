// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wowphmwvlroherqdnajq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvd3BobXd2bHJvaGVycWRuYWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjY3NDUsImV4cCI6MjA2NTU0Mjc0NX0.O91e3u4wOxpmp2OBlnJTQBZlgsixfQBkVT106vt_9rk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);