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
    if (!phone) {
      showMsg('Please enter phone number');
      return;
    }
    
    const fullPhone = phone.startsWith('+') ? phone : '+86' + phone;
    console.log('Sending OTP to phone:'， fullPhone);
    showMsg('Sending code...');
    
    await sendOtp(fullPhone);
    console.log('OTP sent');
    showMsg('Code sent, check SMS');
  } catch (e) {
    console.error('Send failed:', e);
    showMsg('Send failed: ' + e.message);
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    const token = otpInput.value.trim();
    if (!phone || !token) {
      showMsg('Enter phone and code');
      return;
    }
    
    const fullPhone = phone.startsWith('+') ? phone : '+86' + phone;
    console.log('Verifying:', fullPhone);
    showMsg('Verifying...');
    
    const session = await verifyOtp(fullPhone, token);
    if (session) {
      console.log('Login success');
      showMsg('Login success, redirecting...');
      setTimeout(function() {
        window.location.href = './index.html';
      }, 500);
    } else {
      showMsg('Login failed');
    }
  } catch (e) {
    console.error('Login failed:', e);
    showMsg('Login failed: ' + e.message);
  }
});

ensureRedirectIfLogged();
