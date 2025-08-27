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
    console。log('Sending OTP to: ' + fullPhone);
    showMsg('Sending verification code...');
    
    await sendOtp(fullPhone);
    console.log('OTP sent successfully');
    showMsg('Verification code sent, please check SMS');
  } catch (e) {
    console.error('OTP send failed: ' + e);
    showMsg('Send failed: ' + e.message);
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    const token = otpInput.value.trim();
    if (!phone || !token) {
      showMsg('Please enter phone and verification code');
      return;
    }
    
    const fullPhone = phone.startsWith('+') ? phone : '+86' + phone;
    console.log('Verifying OTP for: ' + fullPhone);
    showMsg('Verifying...');
    
    const session = await verifyOtp(fullPhone, token);
    if (session) {
      console.log('Login successful');
      showMsg('Login successful, redirecting...');
      setTimeout(function() {
        window.location.href = './index.html';
      }, 500);
    } else {
      showMsg('Login failed, please try again');
    }
  } catch (e) {
    console.error('Login failed: ' + e);
    showMsg('Login failed: ' + e.message);
  }
});

ensureRedirectIfLogged();
