import { sendOtp, verifyOtp } from './auth.js';
import { getSession } from './database.js';

const phoneInput = document.getElementById('phone');
const otpInput = document.getElementById('otp');
const sendBtn = document.getElementById('btn-send');
const loginBtn = document.getElementById('btn-login');
const msgBox = document.getElementById('login-msg');

function showMsg(text) {
  msgBox.textContent = text;
  msgBox.style.display = 'flex';
}

async function ensureRedirectIfLogged() {
  const session = await getSession();
  if (session) {
    window.location.href = './index.html';
  }
}

sendBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    if (!phone) return showMsg('请填写手机号');
    
    // 自动添加+86前缀
    const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`;
    console.log('[调试] 发送OTP到手机号:'， fullPhone);
    showMsg('正在发送验证码...');
    
    await sendOtp(fullPhone);
    console.log('[调试] OTP发送成功');
    showMsg('验证码已发送，请查收短信');
  } catch (e) {
    console。error('[调试] OTP发送失败:'， e);
    showMsg('发送失败：' + (e.message || e));
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    const token = otpInput.value.trim();
    if (!phone || !token) return showMsg('请填写手机号与验证码');
    
    // 自动添加+86前缀
    const fullPhone = phone.startsWith('+') ? phone : `+86${phone}`;
    console.log('[调试] 验证OTP:', { phone: fullPhone, token: token.substring(0, 3) + '***' });
    showMsg('正在验证...');
    
    const session = await verifyOtp(fullPhone, token);
    if (session) {
      console.log('[调试] 登录成功');
      showMsg('登录成功，正在跳转...');
      setTimeout(() => window.location.href = './index.html', 500);
    } else {
      showMsg('登录失败，请重试');
    }
  } catch (e) {
    console.error('[调试] 登录失败:', e);
    showMsg('登录失败：' + (e.message || e));
  }
});

ensureRedirectIfLogged();
