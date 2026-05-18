import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jdkwoucrswvbymrfbnoh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impka3dvdWNyc3d2YnltcmZibm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDg0MzEsImV4cCI6MjA5NDQyNDQzMX0.beTcUOs8fFY4Yu9rVtNPhsESw82Vm5S6iO7roBZAfMU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)