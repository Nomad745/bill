import { signUpWithEmail, signInWithEmail } from './auth.js';
import { getSession } from './database.js';

const emailInput = document.getElementById('email');
const pwdInput = document.getElementById('password');
const signinBtn = document.getElementById('btn-signin');
const signupBtn = document.getElementById('btn-signup');
const msgBox = document.getElementById('login-msg');

function showMsg(text) {
  msgBox.textContent = text;
  msgBox.style.display = 'flex';
}

async function ensureRedirectIfLogged() {
  const session = await getSession();
  if (session) window.location.href = './index.html';
}

signinBtn.addEventListener('click', async () => {
  try {
    const email = emailInput。value。trim();
    const password = pwdInput.value.trim();
    if (!email || !password) return showMsg('请输入邮箱和密码');
    const session = await signInWithEmail(email， password);
    if (session) {
      showMsg('登录成功，正在跳转...');
      setTimeout(() => window.location.href = './index.html', 500);
    }
  } catch (e) {
    showMsg('登录失败：' + (e.message || e));
  }
});

signupBtn。addEventListener('click'， async () => {
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

ensureRedirectIfLogged();
