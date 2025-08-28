import { signUpWithEmail, signInWithEmail, resetPassword } from './auth.js';
import { getSession } from './database.js';

document.addEventListener('DOMContentLoaded', function() {
  // DOM元素 (updated to match new HTML structure)
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const forgotForm = document.getElementById('forgot-form');
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('remember-me');
  const forgotPasswordLink = document.getElementById('forgot-password');
  const signinBtn = document.getElementById('btn-signin');
  const signupBtn = document.getElementById('btn-signup');
  
  const signupEmailInput = document.getElementById('signup-email');
  const signupPasswordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const agreeTermsCheckbox = document.getElementById('agree-terms');
  const passwordStrengthDiv = document.getElementById('password-strength');
  const signupSubmitBtn = document.getElementById('btn-signup-submit');
  const backToLoginBtn = document.getElementById('btn-back-to-login');
  
  const resetEmailInput = document.getElementById('reset-email');
  const sendResetBtn = document.getElementById('btn-send-reset');
  const backFromForgotBtn = document.getElementById('btn-back-from-forgot');
  
  const msgBox = document.getElementById('auth-msg');

  if (!loginForm || !signupForm || !forgotForm || !msgBox) {
    console.error('关键DOM元素获取失败');
    return;
  }

  function showMsg(text, type = 'info') {
    msgBox.textContent = text;
    msgBox.className = `glass-alert ${type}`;
    msgBox.style.display = 'block';
    
    // 自动隐藏成功/错误消息
    if (type === 'success' || type === 'error') {
      setTimeout(hideMsg, 5000);
    }
  }

  function hideMsg() {
    msgBox.style.display = 'none';
  }

  function showForm(formToShow) {
    // 隐藏所有表单
    [loginForm, signupForm, forgotForm].forEach(form => {
      form.style.display = 'none';
    });
    
    // 显示指定表单
    formToShow.style.display = 'flex';
    
    // 清空消息
    hideMsg();
  }

  function clearInputs() {
    // 清空所有输入框
    [emailInput, passwordInput, signupEmailInput, signupPasswordInput, 
     confirmPasswordInput, resetEmailInput].forEach(input => {
      if (input) input.value = '';
    });
    
    // 重置复选框
    [rememberMeCheckbox, agreeTermsCheckbox].forEach(checkbox => {
      if (checkbox) checkbox.checked = false;
    });
    
    // 重置密码强度
    if (passwordStrengthDiv) {
      passwordStrengthDiv.className = 'password-strength';
    }
  }

  function checkPasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }

  function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    passwordStrengthDiv.className = `password-strength ${strength}`;
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function ensureRedirectIfLogged() {
    try {
      const session = await getSession();
      if (session?.user) {
        // 用户已登录，重定向到主页面
        window.location.href = './index.html';
      }
    } catch (error) {
      console.log('用户未登录，显示登录页面');
    }
  }

  // 登录按钮事件
  signinBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showMsg('请输入邮箱和密码', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMsg('请输入有效的邮箱地址', 'error');
      return;
    }

    try {
      signinBtn.disabled = true;
      signinBtn.textContent = '登录中...';

      await signInWithEmail(email, password);
      
      // 记住邮箱
      if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      showMsg('登录成功！正在跳转...', 'success');
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        window.location.href = './index.html';
      }, 1000);

    } catch (error) {
      console.error('登录失败:', error);
      showMsg('登录失败：' + (error.message || error), 'error');
    } finally {
      signinBtn.disabled = false;
      signinBtn.textContent = '登录';
    }
  });

  // 注册按钮事件
  signupBtn.addEventListener('click', () => {
    showForm(signupForm);
    clearInputs();
  });

  // 注册提交按钮事件
  signupSubmitBtn.addEventListener('click', async () => {
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreeTerms = agreeTermsCheckbox.checked;

    if (!email || !password || !confirmPassword) {
      showMsg('请填写所有必填字段', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMsg('请输入有效的邮箱地址', 'error');
      return;
    }

    if (password.length < 6) {
      showMsg('密码长度至少6位', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMsg('两次输入的密码不一致', 'error');
      return;
    }

    if (!agreeTerms) {
      showMsg('请同意服务条款和隐私政策', 'error');
      return;
    }

    try {
      signupSubmitBtn.disabled = true;
      signupSubmitBtn.textContent = '创建中...';

      await signUpWithEmail(email, password);
      
      showMsg('账户创建成功！请检查邮箱并点击确认链接完成注册。', 'success');
      
      // 清空表单并返回登录页面
      setTimeout(() => {
        showForm(loginForm);
        clearInputs();
      }, 3000);

    } catch (error) {
      console.error('注册失败:', error);
      showMsg('注册失败：' + (error.message || error), 'error');
    } finally {
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.textContent = '创建账户';
    }
  });

  // 返回登录按钮事件
  backToLoginBtn.addEventListener('click', () => {
    showForm(loginForm);
    clearInputs();
  });

  // 忘记密码链接事件
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm(forgotForm);
    clearInputs();
  });

  // 发送重置链接按钮事件
  sendResetBtn.addEventListener('click', async () => {
    const email = resetEmailInput.value.trim();

    if (!email) {
      showMsg('请输入邮箱地址', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMsg('请输入有效的邮箱地址', 'error');
      return;
    }

    try {
      sendResetBtn.disabled = true;
      sendResetBtn.textContent = '发送中...';

      await resetPassword(email);
      
      showMsg('密码重置链接已发送到您的邮箱，请查收。', 'success');
      
      // 清空表单并返回登录页面
      setTimeout(() => {
        showForm(loginForm);
        clearInputs();
      }, 3000);

    } catch (error) {
      console.error('发送重置链接失败:', error);
      showMsg('发送失败：' + (error.message || error), 'error');
    } finally {
      sendResetBtn.disabled = false;
      sendResetBtn.textContent = '发送重置链接';
    }
  });

  // 从忘记密码返回按钮事件
  backFromForgotBtn.addEventListener('click', () => {
    showForm(loginForm);
    clearInputs();
  });

  // 密码强度实时更新
  signupPasswordInput.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // 回车键提交表单
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      if (loginForm.style.display !== 'none') {
        signinBtn.click();
      } else if (signupForm.style.display !== 'none') {
        signupSubmitBtn.click();
      } else if (forgotForm.style.display !== 'none') {
        sendResetBtn.click();
      }
    }
  });

  // 记住我功能
  rememberMeCheckbox.addEventListener('change', (e) => {
    if (!e.target.checked) {
      localStorage.removeItem('rememberEmail');
    }
  });

  // 初始化页面
  ensureRedirectIfLogged();
  
  // 恢复记住的邮箱
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }
  
  // 默认显示登录表单
  showForm(loginForm);
});