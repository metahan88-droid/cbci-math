import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,  // ⚠️ 이게 매우 중요!
    flowType: 'pkce',
    storage: window.localStorage,  // 명시적으로 localStorage 사용
  }
});