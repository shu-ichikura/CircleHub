import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hdkascxbgeoewvkviajp.supabase.co" // SupabaseのURL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka2FzY3hiZ2VvZXd2a3ZpYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDQzMzUsImV4cCI6MjA1MjYyMDMzNX0.WPiNdtG5aADOSg6OHtdmQLqTGWfhwmIVCetosM-2YSo" // SupabaseのAPIキー

export const supabase = createClient(supabaseUrl, supabaseAnonKey)