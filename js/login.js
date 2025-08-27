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
    console.log('Phone:'， fullPhone);
    showMsg('Sending...');
    
    await sendOtp(fullPhone);
    console.log('Sent');
    showMsg('Sent, check SMS');
  } catch (e) {
    console.error('Error:', e);
    showMsg('Error: ' + e.message);
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
    console.log('Verify:', fullPhone);
    showMsg('Verifying...');
    
    const session = await verifyOtp(fullPhone, token);
    if (session) {
      console.log('Success');
      showMsg('Success, redirecting...');
      setTimeout(function() {
        window.location.href = './index.html';
      }, 500);
    } else {
      showMsg('Failed');
    }
  } catch (e) {
    console.error('Error:', e);
    showMsg('Error: ' + e.message);
  }
});

ensureRedirectIfLogged();
