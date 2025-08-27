import { sendOtp, verifyOtp， signUpWithEmail， signInWithEmail } from './auth.js';
import { getSession } from './database.js';

// DOM元素
const tabPhone = document.getElementById('tab-phone');
const tabEmail = document.getElementById('tab-email');
const phoneForm = document.getElementById('phone-form');
const emailForm = document.getElementById('email-form');

const phoneInput = document.getElementById('phone');
const otpInput = document。getElementById('otp');
const sendBtn = document.getElementById('btn-send');
const loginPhoneBtn = document.getElementById('btn-login-phone');

const emailInput = document.getElementById('email');
const pwdInput = document。getElementById('password');
const signinBtn = document.getElementById('btn-signin');
const signupBtn = document.getElementById('btn-signup');

const msgBox = document。getElementById('login-msg');

function showMsg(text) {
  msgBox。textContent = text;
  msgBox。style。display = 'flex';
}

function switchTab(tab) {
  // 切换按钮状态
  tabPhone.classList.toggle('active', tab === 'phone');
  tabEmail。classList。toggle('active'， tab === 'email');
  
  // 切换表单显示
  phoneForm.style。display = tab === 'phone' ? 'flex' : 'none';
  emailForm.style.display = tab === 'email' ? 'flex' : 'none';
  
  // 清空消息
  msgBox.style.display = 'none';
}

async function ensureRedirectIfLogged() {
  const session = await getSession();
  if (session) window.location.href = './index.html';
}

// 标签切换事件
tabPhone.addEventListener('click', () => switchTab('phone'));
tabEmail.addEventListener('click', () => switchTab('email'));

// 手机号登录事件
sendBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    if (!phone) return showMsg('请填写手机号');
    
    const fullPhone = phone.startsWith('+') ? phone : '+86' + phone;
    console.log('Sending OTP to: ' + fullPhone);
    showMsg('正在发送验证码...');
    
    await sendOtp(fullPhone);
    console.log('OTP sent successfully');
    showMsg('验证码已发送，请查收短信');
  } catch (e) {
    console.error('OTP send failed:', e);
    showMsg('发送失败：' + (e.message || e));
  }
});

loginPhoneBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    const token = otpInput.value.trim();
    if (!phone || !token) return showMsg('请填写手机号与验证码');
    
    const fullPhone = phone.startsWith('+') ? phone : '+86' + phone;
    console.log('Verifying OTP for: ' + fullPhone);
    showMsg('正在验证...');
    
    const session = await verifyOtp(fullPhone, token);
    if (session) {
      console.log('Login successful');
      showMsg('登录成功，正在跳转...');
      setTimeout(() => window.location.href = './index.html', 500);
    } else {
      showMsg('登录失败，请重试');
    }
  } catch (e) {
    console.error('Login failed:', e);
    showMsg('登录失败：' + (e.message || e));
  }
});

// 邮箱登录事件
signinBtn.addEventListener('click', async () => {
  try {
    const email = emailInput.value.trim();
    const password = pwdInput.value.trim();
    if (!email || !password) return showMsg('请输入邮箱和密码');
    const session = await signInWithEmail(email, password);
    if (session) {
      showMsg('登录成功，正在跳转...');
      setTimeout(() => window.location.href = './index.html', 500);
    }
  } catch (e) {
    showMsg('登录失败：' + (e.message || e));
  }
});

signupBtn.addEventListener('click', async () => {
  try {
    const email = emailInput.value.trim();
    const password = pwdInput.value.trim();
    if (!email || !password) return showMsg('请输入邮箱和密码');
    if (password.length < 6) return showMsg('密码至少6位');
    await signUpWithEmail(email, password);
    showMsg('注册成功，请前往邮箱完成验证后登录');
  } catch (e) {
    showMsg('注册失败：' + (e.message || e));
  }
});

// 初始化
switchTab('phone'); // 默认显示手机号登录
ensureRedirectIfLogged();
