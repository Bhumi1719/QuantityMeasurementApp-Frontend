'use strict';

// UNIT DEFINITIONS 
const CATEGORIES = {
  length: {
    icon: '📏',
    label: 'Length',
    units: {
      meter:      { label: 'Meter (m)',       toBase: v => v,             fromBase: v => v },
      kilometer:  { label: 'Kilometer (km)',  toBase: v => v * 1000,      fromBase: v => v / 1000 },
      centimeter: { label: 'Centimeter (cm)', toBase: v => v / 100,       fromBase: v => v * 100 },
      millimeter: { label: 'Millimeter (mm)', toBase: v => v / 1000,      fromBase: v => v * 1000 },
      inch:       { label: 'Inch (in)',       toBase: v => v * 0.0254,    fromBase: v => v / 0.0254 },
      foot:       { label: 'Foot (ft)',       toBase: v => v * 0.3048,    fromBase: v => v / 0.3048 },
    }
  },
  weight: {
    icon: '⚖️',
    label: 'Weight',
    units: {
      gram:     { label: 'Gram (g)',      toBase: v => v,           fromBase: v => v },
      kilogram: { label: 'Kilogram (kg)', toBase: v => v * 1000,    fromBase: v => v / 1000 },
      pound:    { label: 'Pound (lb)',    toBase: v => v * 453.592, fromBase: v => v / 453.592 },
    }
  },
  temperature: {
    icon: '🌡️',
    label: 'Temperature',
    units: {
      celsius:    { label: 'Celsius (°C)' },
      fahrenheit: { label: 'Fahrenheit (°F)' },
      kelvin:     { label: 'Kelvin (K)' },
    }
  },
  volume: {
    icon: '🧪',
    label: 'Volume',
    units: {
      liter:      { label: 'Liter (L)',       toBase: v => v,        fromBase: v => v },
      milliliter: { label: 'Milliliter (mL)', toBase: v => v / 1000, fromBase: v => v * 1000 },
      gallon:     { label: 'Gallon (gal)',    toBase: v => v * 3.785, fromBase: v => v / 3.785 },
    }
  },

};

// State

const state = {
  currentPage:     'home',
  currentCategory: null,
  currentOp:       'convert',
};

// Conversion Functions
function convertValue(category, fromUnit, toUnit, value) {
  if (isNaN(value)) throw new Error('Please enter a valid number.');

  if (category === 'temperature') {
    return convertTemperature(fromUnit, toUnit, value);
  }

  const cat = CATEGORIES[category];
  const baseValue = cat.units[fromUnit].toBase(value);
  return cat.units[toUnit].fromBase(baseValue);
}

/** Temperature conversion (special case) */
function convertTemperature(from, to, v) {
  if (from === to) return v;

  // Convert to Celsius first
  let c;
  if (from === 'celsius')    c = v;
  if (from === 'fahrenheit') c = (v - 32) * 5/9;
  if (from === 'kelvin')     {
    if (v < 0) throw new Error('Kelvin cannot be negative.');
    c = v - 273.15;
  }

  // Convert Celsius to target
  if (to === 'celsius')    return c;
  if (to === 'fahrenheit') return c * 9/5 + 32;
  if (to === 'kelvin')     return c + 273.15;
}

function arithmeticOp(category, op, val1, unit1, val2, unit2) {
  if (isNaN(val1) || isNaN(val2)) throw new Error('Please enter valid numbers for both values.');
  if (op === 'divide' && val2 === 0) throw new Error('Cannot divide by zero.');

  if (category === 'temperature') {
    // For temperature, operate on raw values
    let result;
    if (op === 'add')      result = val1 + val2;
    if (op === 'subtract') result = val1 - val2;
    if (op === 'multiply') result = val1 * val2;
    if (op === 'divide')   result = val1 / val2;
    return { result, unit: unit1 };
  }

  const cat = CATEGORIES[category];
  const base1 = cat.units[unit1].toBase(val1);
  const base2 = cat.units[unit2].toBase(val2);

  let baseResult;
  if (op === 'add')      baseResult = base1 + base2;
  if (op === 'subtract') baseResult = base1 - base2;
  if (op === 'multiply') baseResult = base1 * base2;
  if (op === 'divide')   baseResult = base1 / base2;

  const finalResult = cat.units[unit1].fromBase(baseResult);
  return { result: finalResult, unit: unit1 };
}

/* Compare two values after converting to base unit */
function compareValues(category, val1, unit1, val2, unit2) {
  if (isNaN(val1) || isNaN(val2)) throw new Error('Please enter valid numbers for both values.');

  let base1, base2;
  if (category === 'temperature') {
    base1 = convertTemperature(unit1, 'celsius', val1);
    base2 = convertTemperature(unit2, 'celsius', val2);
  } else {
    const cat = CATEGORIES[category];
    base1 = cat.units[unit1].toBase(val1);
    base2 = cat.units[unit2].toBase(val2);
  }

  if (Math.abs(base1 - base2) < 1e-10) return `${fmt(val1)} ${unitLabel(category, unit1)} = ${fmt(val2)} ${unitLabel(category, unit2)}  ✓ Equal`;
  if (base1 > base2) return `${fmt(val1)} ${unitLabel(category, unit1)} > ${fmt(val2)} ${unitLabel(category, unit2)}`;
  return `${fmt(val1)} ${unitLabel(category, unit1)} < ${fmt(val2)} ${unitLabel(category, unit2)}`;
}

/** Format a number nicely (up to 8 sig figs) */
function fmt(n) {
  if (typeof n !== 'number') return n;
  // Use toPrecision for very large/small, otherwise toFixed up to 6
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) return n.toPrecision(6);
  return parseFloat(n.toFixed(8)).toString();
}

/** Get display label for a unit */
function unitLabel(category, unitKey) {
  const u = CATEGORIES[category]?.units[unitKey];
  return u ? u.label : unitKey;
}

/** Timestamp string */
function timeStampStr(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

/** Debounce helper */
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}


const HIST_KEY = 'qms_history';

/** Get history key scoped to logged-in user's email */
function histKey() {
  const user = getSession();
  return user ? `${HIST_KEY}_${user.email}` : null;
}

/** Get history only for current logged-in user */
function getHistory() {
  const key = histKey();
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

/** Save to history only if user is logged in */
function saveToHistory(record) {
  const key = histKey();
  if (!key) return; // not logged in — don't save
  const hist = getHistory();
  hist.unshift({ ...record, id: Date.now(), timestamp: Date.now() });
  localStorage.setItem(key, JSON.stringify(hist.slice(0, 200)));
}

/** Clear history only for current user */
function clearHistory() {
  const key = histKey();
  if (key) localStorage.removeItem(key);
}

const USERS_KEY   = 'qms_users';
const SESSION_KEY = 'qms_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() { return !!getSession(); }

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    state.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/** Populate unit dropdowns for the given category */
function populateUnits(category) {
  const units = CATEGORIES[category].units;
  const fromEl  = document.getElementById('fromUnit');
  const toEl    = document.getElementById('toUnit');
  const secEl   = document.getElementById('secondUnit');

  [fromEl, toEl, secEl].forEach(el => {
    el.innerHTML = '';
    Object.entries(units).forEach(([key, data]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = data.label;
      el.appendChild(opt);
    });
  });

  // Default: different from/to units
  const keys = Object.keys(units);
  fromEl.value = keys[0];
  toEl.value   = keys.length > 1 ? keys[1] : keys[0];
  secEl.value  = keys[0];
}

/** Open a category page */
function openCategory(category) {
  state.currentCategory = category;
  state.currentOp = 'convert';

  const cat = CATEGORIES[category];
  document.getElementById('catIconLg').textContent = cat.icon;
  document.getElementById('catTitle').textContent  = cat.label;

  populateUnits(category);
  document.getElementById('inputValue').value  = '';
  document.getElementById('inputValue2').value = '';
  document.getElementById('resultValue').textContent = '—';
  document.getElementById('resultDetail').textContent = '';
  document.getElementById('errorMsg').textContent = '';

  // Reset op buttons
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-op="convert"]').classList.add('active');

  // Hide second value group and calc btn for convert
  document.getElementById('secondValueGroup').style.display = 'none';
  document.getElementById('calcBtn').style.display = 'none';

  showPage('category');
}

/** Run the current operation */
function runOperation() {
  clearError();
  const category = state.currentCategory;
  const op       = state.currentOp;
  const val1     = parseFloat(document.getElementById('inputValue').value);
  const val2     = parseFloat(document.getElementById('inputValue2').value);
  const fromUnit = document.getElementById('fromUnit').value;
  const toUnit   = document.getElementById('toUnit').value;
  const secUnit  = document.getElementById('secondUnit').value;

  let resultText = '';
  let detailText = '';
  let histRecord = null;

  try {
    if (op === 'convert') {
      if (isNaN(val1)) throw new Error('Please enter a value to convert.');
      const result = convertValue(category, fromUnit, toUnit, val1);
      resultText = `${fmt(result)} ${unitLabel(category, toUnit)}`;
      detailText = `${fmt(val1)} ${unitLabel(category, fromUnit)} = ${fmt(result)} ${unitLabel(category, toUnit)}`;
      histRecord = {
        category, op,
        expression: `${fmt(val1)} ${unitLabel(category, fromUnit)} → ${unitLabel(category, toUnit)}`,
        result: resultText
      };
    }

    else if (['add','subtract','multiply','divide'].includes(op)) {
      const { result, unit } = arithmeticOp(category, op, val1, fromUnit, val2, secUnit);
      const opSymbols = { add:'+', subtract:'−', multiply:'×', divide:'÷' };
      resultText = `${fmt(result)} ${unitLabel(category, unit)}`;
      detailText = `${fmt(val1)} ${unitLabel(category, fromUnit)} ${opSymbols[op]} ${fmt(val2)} ${unitLabel(category, secUnit)}`;
      histRecord = {
        category, op,
        expression: detailText,
        result: resultText
      };
    }

    else if (op === 'compare') {
      resultText = compareValues(category, val1, fromUnit, val2, secUnit);
      histRecord = {
        category, op,
        expression: `${fmt(val1)} ${unitLabel(category, fromUnit)} vs ${fmt(val2)} ${unitLabel(category, secUnit)}`,
        result: resultText
      };
    }

    // Show result with pop animation
    const rb = document.getElementById('resultBox');
    rb.classList.remove('pop');
    void rb.offsetWidth; // reflow
    rb.classList.add('pop');

    document.getElementById('resultValue').textContent = resultText;
    document.getElementById('resultDetail').textContent = detailText;

    // Save to history
    if (histRecord) saveToHistory(histRecord);

  } catch (e) {
    showError(e.message);
  }
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
}
function clearError() {
  document.getElementById('errorMsg').textContent = '';
}


/** Render all history items filtered by search/filter */
function renderHistory(search = '', category = '') {
  let items = getHistory();

  if (category) items = items.filter(i => i.category === category);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.expression?.toLowerCase().includes(q) ||
      i.result?.toLowerCase().includes(q) ||
      i.op?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q)
    );
  }

  const list  = document.getElementById('histList');
  const empty = document.getElementById('histEmpty');

  list.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'hist-item';
    el.style.animationDelay = `${idx * 0.04}s`;
    el.innerHTML = `
      <span class="hist-op-badge badge-${item.op}">${item.op}</span>
      <div class="hist-info">
        <div class="hist-info-top">${escHtml(item.expression || '—')}</div>
        <div class="hist-info-bottom">= ${escHtml(item.result || '—')} · ${CATEGORIES[item.category]?.icon || ''} ${item.category}</div>
      </div>
      <span class="hist-time">${timeStampStr(item.timestamp)}</span>
    `;
    list.appendChild(el);
  });
}

/** Simple HTML escaping */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');

  errEl.textContent = '';

  if (!email || !pass) { errEl.textContent = 'Please fill in all fields.'; return; }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === pass);

  if (!user) { errEl.textContent = 'Invalid email or password.'; return; }

  setSession(user);
  openHistoryPage();
}

function doSignup() {
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass  = document.getElementById('signupPassword').value;
  const errEl = document.getElementById('signupError');

  errEl.textContent = '';

  if (!name || !email || !pass) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email.'; return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { errEl.textContent = 'Email already registered.'; return; }

  const user = { name, email, password: pass };
  saveUser(user);
  setSession(user);
  openHistoryPage();
}

function doLogout() {
  clearSession();
  showPage('home');
}

function openHistoryPage() {
  if (!isLoggedIn()) { showPage('login'); return; }
  const user = getSession();
  document.getElementById('histUser').textContent = `Welcome, ${user.name}`;
  document.getElementById('histSearch').value  = '';
  document.getElementById('histFilter').value  = '';
  renderHistory();
  showPage('history');
}

document.addEventListener('DOMContentLoaded', () => {

  // Category cards → open category page
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => openCategory(card.dataset.category));
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', () => showPage('home'));

  // Swap units
  document.getElementById('swapUnits').addEventListener('click', () => {
    const from = document.getElementById('fromUnit');
    const to   = document.getElementById('toUnit');
    [from.value, to.value] = [to.value, from.value];
  });

  // Op buttons
  document.querySelectorAll('.op-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentOp = btn.dataset.op;

      // Show second value + calculate button for non-convert operations
      const needsSecond = ['add','subtract','multiply','divide','compare'].includes(state.currentOp);
      document.getElementById('secondValueGroup').style.display = needsSecond ? 'block' : 'none';
      document.getElementById('calcBtn').style.display = needsSecond ? 'block' : 'none';

      // Clear result when switching op
      document.getElementById('resultValue').textContent = '—';
      document.getElementById('resultDetail').textContent = '';
      clearError();
    });
  });

  // Calculate button click
  document.getElementById('calcBtn').addEventListener('click', runOperation);

  // Run op on Enter in input fields
  ['inputValue','inputValue2'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') runOperation();
    });
    // Also run automatically when value changes (debounced, only for convert)
    document.getElementById(id).addEventListener('input', debounce(() => {
      if (state.currentOp === 'convert') runOperation();
    }, 350));
  });

  // Also auto-convert on unit change
  ['fromUnit','toUnit'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      if (state.currentOp === 'convert' && document.getElementById('inputValue').value !== '') {
        runOperation();
      }
    });
  });

  // View history button
  document.getElementById('btnViewHistory').addEventListener('click', () => {
    if (isLoggedIn()) { openHistoryPage(); }
    else { showPage('login'); }
  });

  // Login
  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  // Signup
  document.getElementById('signupBtn').addEventListener('click', doSignup);
  document.getElementById('signupPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSignup();
  });

  // Auth page switching
  document.getElementById('goSignup').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('loginError').textContent = '';
    showPage('signup');
  });
  document.getElementById('goLogin').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('signupError').textContent = '';
    showPage('login');
  });



  // Home button on history page
  document.getElementById('histBackBtn').addEventListener('click', () => showPage('home'));

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', doLogout);

  // History search / filter
  document.getElementById('histSearch').addEventListener('input', debounce(() => {
    renderHistory(
      document.getElementById('histSearch').value,
      document.getElementById('histFilter').value
    );
  }, 250));

  document.getElementById('histFilter').addEventListener('change', () => {
    renderHistory(
      document.getElementById('histSearch').value,
      document.getElementById('histFilter').value
    );
  });

  // Clear history
  document.getElementById('clearHistBtn').addEventListener('click', () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
      renderHistory();
    }
  });



  // Initial page
  showPage('home');
});
