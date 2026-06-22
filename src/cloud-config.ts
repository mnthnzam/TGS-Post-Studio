// Supabase connection (public values — the anon key is meant to ship in the client;
// row-level security + email auth protect the data).
export const SUPABASE_URL = 'https://cavfqygngwthwiwjstvh.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdmZxeWduZ3d0aHdpd2pzdHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzI3OTEsImV4cCI6MjA5NzY0ODc5MX0.4DUEa9h-7jz_HOcVYqJVZhZ8cMvCwqGEj2JR_8ABRxQ';

export const cloudEnabled =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20 && typeof window !== 'undefined' && window.location.protocol !== 'file:';
