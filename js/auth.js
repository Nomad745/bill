import { supabase } from './database.js';

// 手机号OTP认证 - 使用 Twilio Verify
export async function sendOtp(phone) {
  // 确保手机号格式正确
  const formattedPhone = phone.startsWith('+') ? phone : `+86${phone}`;
  
  console.log('Sending OTP via Twilio Verify to:', formattedPhone);
  
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      channel: 'sms',
      shouldCreateUser: true,
      // Twilio Verify 特定配置
      data: {
        // 可以添加额外的用户元数据
        provider: 'twilio_verify'
      }
    },
  });
  
  if (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
  
  console.log('OTP sent successfully via Twilio Verify');
}

export async function verifyOtp(phone, token) {
  // 确保手机号格式正确
  const formattedPhone = phone.startsWith('+') ? phone : `+86${phone}`;
  
  console.log('Verifying OTP via Twilio Verify for:', formattedPhone);
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token,
    type: 'sms',
  });
  
  if (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
  
  console.log('OTP verified successfully via Twilio Verify');
  return data.session || null;
}

// 邮箱密码认证
export async function signUpWithEmail(email, password) {
  console.log('Signing up with email:', email);
  
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: window.location.origin + '/login.html'
    }
  });
  
  if (error) {
    console.error('Signup error:', error);
    throw error;
  }
  
  console.log('Signup successful');
  return data;
}

export async function signInWithEmail(email, password) {
  console.log('Signing in with email:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    console.error('Signin error:', error);
    throw error;
  }
  
  console.log('Signin successful');
  return data.session || null;
}

// 找回密码
export async function resetPassword(email) {
  console.log('Resetting password for email:', email);
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login.html'
  });
  
  if (error) {
    console.error('Password reset error:', error);
    throw error;
  }
  
  console.log('Password reset email sent successfully');
  return data;
}

// 更新密码（在重置密码页面使用）
export async function updatePassword(newPassword) {
  console.log('Updating password');
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error('Password update error:', error);
    throw error;
  }
  
  console.log('Password updated successfully');
  return data;
}
