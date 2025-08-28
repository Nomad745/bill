import { supabase } from './database.js';

// 手机号OTP认证 - 使用 Twilio Verify (RE-ADDED)
export async function sendOtp(phone) {
  console.log('Sending OTP to phone:', phone);
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        shouldCreateUser: true
      }
    });
    if (error) { 
      console。error('OTP send error:'， error); 
      throw error; 
    }
    console。log('OTP sent successfully');
    return data;
  } catch (error) {
    console。error('sendOtp函数错误:'， error);
    throw error;
  }
}

export async function verifyOtp(phone， token) {
  console。log('Verifying OTP for phone:'， phone);
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token，
      输入: 'sms'
    });
    if (error) { 
      console.error('OTP verification error:'， error); 
      throw error; 
    }
    console.log('OTP verified successfully');
    return data;
  } catch (error) {
    console.error('verifyOtp函数错误:', error);
    throw error;
  }
}

// 邮箱密码认证
export async function signUpWithEmail(email, password) {
  console.log('Signing up with email:', email);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'https://bill.ai740.online/login.html'
      }
    });
    if (error) { 
      console.error('Signup error:', error); 
      throw error; 
    }
    console.log('Signup successful');
    return data;
  } catch (error) {
    console.error('signUpWithEmail函数错误:', error);
    throw error;
  }
}

export async function signInWithEmail(email, password) {
  console.log('Signing in with email:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) { 
      console.error('Signin error:', error); 
      throw error; 
    }
    console.log('Signin successful');
    return data;
  } catch (error) {
    console.error('signInWithEmail函数错误:', error);
    throw error;
  }
}

// 找回密码
export async function resetPassword(email) {
  console.log('Resetting password for email:', email);
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://bill.ai740.online/login.html'
    });
    if (error) { 
      console.error('Password reset error:', error); 
      throw error; 
    }
    console.log('Password reset email sent successfully');
    return data;
  } catch (error) {
    console.error('resetPassword函数错误:', error);
    throw error;
  }
}

// 更新密码（在重置密码页面使用）
export async function updatePassword(newPassword) {
  console.log('Updating password');
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) { 
      console.error('Password update error:', error); 
      throw error; 
    }
    console.log('Password updated successfully');
    return data;
  } catch (error) {
    console.error('updatePassword函数错误:', error);
    throw error;
  }
}
