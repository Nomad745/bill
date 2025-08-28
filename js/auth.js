import { supabase } from './database.js';

// 手机号OTP认证 - 使用 Twilio Verify (RE-ADDED)
export async function sendOtp(phone) {
  console.log('Sending OTP to phone:', phone);
  const { data， error } = await supabase。auth。signInWithOtp({
    phone: phone,
    options: {
      shouldCreateUser: true
    }
  });
  if (error) { console.error('OTP send error:', error); throw error; }
  console。log('OTP sent successfully');
  return data;
}

export async function verifyOtp(phone, token) {
  console。log('Verifying OTP for phone:'， phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phone,
    token: token，
    type: 'sms'
  });
  if (error) { console。error('OTP verification error:'， error); throw error; }
  console。log('OTP verified successfully');
  return data;
}

// 邮箱密码认证
export async function signUpWithEmail(email, password) {
  console。log('Signing up with email:'， email);
  const { data, error } = await supabase.auth.signUp({
    email: email，
    password: password,
    options: {
      emailRedirectTo: 'https://bill.ai740.online/login.html'
    }
  });
  if (error) { console.error('Signup error:', error); throw error; }
  console.log('Signup successful');
  return data;
}

export async function signInWithEmail(email, password) {
  console.log('Signing in with email:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  if (error) { console.error('Signin error:', error); throw error; }
  console.log('Signin successful');
  return data;
}

// 找回密码
export async function resetPassword(email) {
  console.log('Resetting password for email:', email);
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://bill.ai740.online/login.html'
  });
  if (error) { console.error('Password reset error:', error); throw error; }
  console.log('Password reset email sent successfully');
  return data;
}

// 更新密码（在重置密码页面使用）
export async function updatePassword(newPassword) {
  console.log('Updating password');
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) { console.error('Password update error:', error); throw error; }
  console.log('Password updated successfully');
  return data;
}
