import { supabase } from './database.js';

// 手机号OTP认证
export async function sendOtp(phone) {
  const { error } = await supabase。auth。signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token， 输入: 'sms' });
  if (error) throw error;
  return data.session || null;
}

// 邮箱密码认证
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session || null;
}
