import { supabase, getSession, signOut, addRecord, deleteRecord, listRecords } from './database.js';
import { formatDate, formatTime, setActive, computeStats, getQuickRange } from './utils.js';

// DOM元素
const navLogin = document.getElementById('nav-login');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

const filterQuick = document.getElementById('filter-quick');
const filterStart = document.getElementById('filter-start');
const filterEnd = document.getElementById('filter-end');
const filterType = document.getElementById('filter-type');

const qDate = document.getElementById('q-date');
const qTime = document.getElementById('q-time');
const qAmount = document.getElementById('q-amount');
const qNote = document.getElementById('q-note');

const btnExpense = document.getElementById('btn-expense');
const btnIncome = document.getElementById('btn-income');
const btnAdd = document.getElementById('btn-add');

const tbody = document.getElementById('records-body');
const statsDaily = document.getElementById('stats-daily');
const statsPeriod = document.getElementById('stats-period');

let currentType = 'income';
let currentUser = null;

// 用户状态管理
async function checkAuthStatus() {
  try {
    const session = await getSession();
    currentUser = session?.user || null;
    
    if (currentUser) {
      // 用户已登录
      showAuthenticatedUI();
    } else {
      // 用户未登录，重定向到登录页面
      redirectToLogin();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    redirectToLogin();
  }
}

function showAuthenticatedUI() {
  // 显示用户信息
  navLogin.style.display = 'none';
  userInfo.style.display = 'flex';
  userEmail.textContent = currentUser.email || '用户';
  
  // 启用记账功能
  enableAppFeatures();
}

function showUnauthenticatedUI() {
  // 显示登录链接
  navLogin.style.display = 'block';
  userInfo.style.display = 'none';
  
  // 禁用记账功能
  disableAppFeatures();
}

function redirectToLogin() {
  window.location.href = './login.html';
}

// 退出登录
async function handleLogout() {
  try {
    btnLogout.disabled = true;
    btnLogout.textContent = '退出中...';
    
    await signOut();
    currentUser = null;
    
    // 重定向到登录页面
    redirectToLogin();
  } catch (error) {
    console.error('Logout failed:', error);
    alert('退出失败：' + (error.message || error));
    btnLogout.disabled = false;
    btnLogout.textContent = '退出';
  }
}

// 启用应用功能
function enableAppFeatures() {
  // 启用所有输入框和按钮
  const inputs = [qDate, qTime, qAmount, qNote];
  const buttons = [btnExpense, btnIncome, btnAdd];
  
  inputs.forEach(input => {
    if (input) input.disabled = false;
  });
  
  buttons.forEach(button => {
    if (button) button.disabled = false;
  });
  
  // 加载用户数据
  refresh();
}

// 禁用应用功能
function disableAppFeatures() {
  // 禁用所有输入框和按钮
  const inputs = [qDate, qTime, qAmount, qNote];
  const buttons = [btnExpense, btnIncome, btnAdd];
  
  inputs.forEach(input => {
    if (input) input.disabled = true;
  });
  
  buttons.forEach(button => {
    if (button) button.disabled = true;
  });
  
  // 清空数据
  clearData();
}

// 清空数据
function clearData() {
  tbody.innerHTML = '';
  statsDaily.innerHTML = '';
  statsPeriod.innerHTML = '';
}

function setType(type) {
  currentType = type;
  const isExpense = type === 'expense';

  if (isExpense) {
    btnExpense.classList.add('active');
    btnExpense.classList.remove('secondary');
    btnIncome.classList.remove('active');
    btnIncome.classList.add('secondary');
  } else {
    btnIncome.classList.add('active');
    btnIncome.classList.remove('secondary');
    btnExpense.classList.remove('active');
    btnExpense.classList.add('secondary');
  }

  // 可访问性状态，确保互斥
  btnExpense.setAttribute('aria-pressed', String(isExpense));
  btnIncome.setAttribute('aria-pressed', String(!isExpense));
}

function ensureTodayDefaults() {
  const today = formatDate(new Date());
  qDate.value = today;
  const range = getQuickRange('today');
  filterQuick.value = 'today';
  filterStart.value = range.start;
  filterEnd.value = range.end;
}

function renderStats(target, stats) {
  target.innerHTML = `
    <div>收入：<strong>￥${stats.income.toFixed(2)}</strong></div>
    <div>支出：<strong>￥${stats.expense.toFixed(2)}</strong></div>
    <div>结余：<strong>￥${stats.balance.toFixed(2)}</strong></div>
  `;
}

function renderRows(records) {
  tbody.innerHTML = '';
  for (const r of records) {
    const tr = document.createElement('tr');
    const badgeClass = r.type === 'income' ? 'badge-income' : 'badge-expense';
    tr.innerHTML = `
      <td>${r.record_date}</td>
      <td>${r.record_time || ''}</td>
      <td><span class="badge ${badgeClass}">${r.type === 'income' ? '收入' : '支出'}</span></td>
      <td>￥${Number(r.amount).toFixed(2)}</td>
      <td>${r.note || ''}</td>
      <td><button class="glass-button secondary" data-id="${r.id}">删除</button></td>
    `;
    tr.querySelector('button').addEventListener('click', async (e) => {
      try {
        await deleteRecord(r.id);
        await refresh();
      } catch (err) { alert('删除失败：' + (err.message || err)); }
    });
    tbody.appendChild(tr);
  }
}

async function refresh() {
  if (!currentUser) return;
  
  try {
    const range = getQuickRange(filterQuick.value);
    const start = filterStart.value || range.start;
    const end = filterEnd.value || range.end;
    const type = filterType.value;
    
    const records = await listRecords(currentUser.id, { start, end, type });
    renderRows(records);
    
    const dailyStats = computeStats(records.filter(r => r.record_date === formatDate(new Date())));
    const periodStats = computeStats(records);
    
    renderStats(statsDaily, dailyStats);
    renderStats(statsPeriod, periodStats);
  } catch (err) {
    console.error('Refresh failed:', err);
    alert('刷新失败：' + (err.message || err));
  }
}

async function addRecordHandler() {
  if (!currentUser) {
    alert('请先登录');
    return;
  }
  
  try {
    const amount = parseFloat(qAmount.value);
    if (!amount || amount <= 0) {
      alert('请输入有效金额');
      return;
    }
    
    btnAdd.disabled = true;
    btnAdd.textContent = '添加中...';
    
    const record = {
      user_id: currentUser.id,
      record_date: qDate.value,
      record_time: qTime.value || null,
      type: currentType,
      amount: amount,
      note: qNote.value.trim() || null
    };
    
    await addRecord(record);
    
    // 清空表单
    qAmount.value = '';
    qNote.value = '';
    qTime.value = '';
    
    // 刷新数据
    await refresh();
    
    alert('添加成功！');
  } catch (err) {
    console.error('Add record failed:', err);
    alert('添加失败：' + (err.message || err));
  } finally {
    btnAdd.disabled = false;
    btnAdd.textContent = '添加记录';
  }
}

// 事件监听器
btnLogout.addEventListener('click', handleLogout);

filterQuick.addEventListener('change', refresh);
filterStart.addEventListener('change', refresh);
filterEnd.addEventListener('change', refresh);
filterType.addEventListener('change', refresh);

btnExpense.addEventListener('click', () => setType('expense'));
btnIncome.addEventListener('click', () => setType('income'));
btnAdd.addEventListener('click', addRecordHandler);

// 初始化
async function init() {
  try {
    // 检查认证状态
    await checkAuthStatus();
    
    // 设置默认值
    ensureTodayDefaults();
    
    // 设置默认类型
    setType('income');
    
  } catch (error) {
    console.error('Initialization failed:', error);
    redirectToLogin();
  }
}

// 启动应用
init();
