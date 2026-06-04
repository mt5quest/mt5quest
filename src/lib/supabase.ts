import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivlfypuztxbserciodrl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGZ5cHV6dHhic2VyY2lvZHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTAxMTMsImV4cCI6MjA5NDUyNjExM30.V4sTMqhIvb4JXEDg2xi-Ut4M1IYd0l3ep1-5l9yrxlo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
