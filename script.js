/* ============================================================
   Register Form — JavaScript
   Author  : Abdelrahman Ashraf
   Version : 2.0
   Sections:
     1. Particles (background effect)
     2. State
     3. Validation Rules
     4. UI Helpers  (setStatus, showErr)
     5. Field Validation
     6. Live Validation (event listeners)
     7. Password Strength Meter
     8. Password Toggle (show/hide)
     9. Character Counter (bio)
    10. Custom Checkbox (terms)
    11. Progress Indicator
    12. Panel Navigation (next / back)
    13. Form Submit
    14. Form Reset
   ============================================================ */


/* ── 1. Particles ── */
(function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 55; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `bottom: -10px`,
      `--dx: ${(Math.random() - 0.5) * 60}px`,
      `animation-duration: ${7 + Math.random() * 10}s`,
      `animation-delay: ${-Math.random() * 15}s`,
      `opacity: ${0.3 + Math.random() * 0.6}`,
      `width: ${1 + Math.random() * 2}px`,
      `height: ${1 + Math.random() * 2}px`,
    ].join(';');
    container.appendChild(p);
  }
})();


/* ── 2. State ── */
let currentPanel = 1;
const TOTAL_PANELS = 3;


/* ── 3. Validation Rules ──
   Each rule takes the field value (string) and returns
   an error message string, or '' if valid.
   ─────────────────────────────────────────────────── */
const rules = {
  firstName : (v) => v.trim().length >= 2
    ? '' : 'Must be at least 2 characters.',

  lastName  : (v) => v.trim().length >= 2
    ? '' : 'Must be at least 2 characters.',

  email     : (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? '' : 'Enter a valid email address.',

  phone     : (v) => /^\+?[0-9\s\-().]{8,16}$/.test(v.trim())
    ? '' : 'Enter a valid phone number.',

  username  : (v) => /^[a-zA-Z0-9_]{3,20}$/.test(v.trim())
    ? '' : '3–20 characters. Letters, numbers, underscores only.',

  password  : (v) => v.length >= 8
    ? '' : 'Password must be at least 8 characters.',

  confirm   : (v) => v === document.getElementById('password').value
    ? '' : 'Passwords do not match.',

  role      : (v) => v !== ''
    ? '' : 'Please select a role.',

  bio       : (v) => v.trim().length >= 5
    ? '' : 'Bio must be at least 5 characters.',
};

/* Map each panel to the field IDs it contains */
const panelFields = {
  1: ['firstName', 'lastName', 'email', 'phone'],
  2: ['username', 'password', 'confirm'],
  3: ['role', 'bio'],
};


/* ── 4. UI Helpers ── */

/**
 * Sets the validation status icon next to an input.
 * @param {string} id    - field ID
 * @param {string} state - 'ok' | 'err' | '' (hide)
 */
function setStatus(id, state) {
  const si = document.getElementById('si-' + id);
  if (!si) return;

  si.className = 'status-icon';
  if (state === 'ok') {
    si.className = 'status-icon show ok';
    si.innerHTML = '<i class="ti ti-check"></i>';
  } else if (state === 'err') {
    si.className = 'status-icon show err';
    si.innerHTML = '<i class="ti ti-x"></i>';
  }
}

/**
 * Shows or hides an error message below a field.
 * @param {string} id  - field ID
 * @param {string} msg - error text, or '' to clear
 */
function showErr(id, msg) {
  const el = document.getElementById('err-' + id);
  if (!el) return;

  if (msg) {
    el.innerHTML = '<i class="ti ti-alert-circle" style="font-size:13px;"></i> ' + msg;
    el.classList.add('show');
  } else {
    el.textContent = '';
    el.classList.remove('show');
  }
}


/* ── 5. Field Validation ──
   Validates a single field, updates its classes and error message.
   Returns true if valid, false if not.
   ─────────────────────────────────────────────────────────────── */
function validateField(id) {
  const input = document.getElementById(id);
  if (!input || !rules[id]) return true;

  const msg = rules[id](input.value);
  showErr(id, msg);

  /* Selects & textarea — only show error message, no border class */
  if (input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
    return !msg;
  }

  input.classList.toggle('valid',   !msg);
  input.classList.toggle('invalid', !!msg);
  setStatus(id, msg ? 'err' : 'ok');
  return !msg;
}


/* ── 6. Live Validation ──
   Validate on blur (when user leaves the field).
   Re-validate on input if already in 'invalid' state
   so the error clears as soon as the user fixes it.
   ─────────────────────────────────────────────────── */
['firstName', 'lastName', 'email', 'phone', 'username', 'password', 'confirm'].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('blur', () => {
    validateField(id);
  });

  el.addEventListener('input', () => {
    if (el.classList.contains('invalid')) {
      validateField(id);
    }
    /* Special cases that need immediate re-check */
    if (id === 'password') updateStrength(el.value);
    if (id === 'confirm' && el.value) validateField('confirm');
  });
});

/* When password changes, re-validate confirm if it has a value */
document.getElementById('password').addEventListener('input', () => {
  const confirmEl = document.getElementById('confirm');
  if (confirmEl.value) validateField('confirm');
});

/* Role select */
document.getElementById('role').addEventListener('change', () => {
  validateField('role');
});


/* ── 7. Password Strength Meter ──
   Scores the password 0–5 based on length, uppercase,
   numbers, and special characters. Updates 4 color segments.
   ─────────────────────────────────────────────────────────── */
function updateStrength(value) {
  let score = 0;
  if (value.length >= 8)           score++;
  if (value.length >= 12)          score++;
  if (/[A-Z]/.test(value))         score++;
  if (/[0-9]/.test(value))         score++;
  if (/[^A-Za-z0-9]/.test(value))  score++;

  /* Color and label for each strength level */
  const levels = [
    { color: 'rgba(255,255,255,0.08)', label: '' },
    { color: '#ef4444', label: 'Weak' },
    { color: '#f97316', label: 'Fair' },
    { color: '#eab308', label: 'Good' },
    { color: '#22c55e', label: 'Strong 💪' },
  ];

  const level = levels[Math.min(score, 4)];

  /* Fill segments up to the score level */
  for (let i = 1; i <= 4; i++) {
    document.getElementById('seg-' + i).style.background =
      i <= Math.min(score, 4) ? level.color : 'rgba(255,255,255,0.08)';
  }

  document.getElementById('strengthText').textContent =
    value.length ? 'Strength: ' + level.label : '';
}


/* ── 8. Password Toggle ──
   Switches input type between 'password' and 'text',
   and swaps the eye icon accordingly.
   ─────────────────────────────────────────────────── */
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);

  if (input.type === 'password') {
    input.type    = 'text';
    icon.className = 'ti ti-eye-off icon-right';
  } else {
    input.type    = 'password';
    icon.className = 'ti ti-eye icon-right';
  }
}


/* ── 9. Character Counter (bio) ── */
document.getElementById('bio').addEventListener('input', function () {
  const len = this.value.length;
  const counter = document.getElementById('charCount');
  counter.textContent = len + ' / 200';
  counter.className   = 'char-count' + (len > 180 ? ' over' : len > 150 ? ' warn' : '');

  /* Clear error once user has typed enough */
  if (this.value.trim().length >= 5) showErr('bio', '');
});


/* ── 10. Custom Checkbox (Terms) ── */
function toggleTerms() {
  const checkbox = document.getElementById('terms');
  const ui       = document.getElementById('checkboxUi');
  const row      = document.getElementById('termsRow');

  checkbox.checked = !checkbox.checked;
  ui.classList.toggle('checked', checkbox.checked);
  row.setAttribute('aria-checked', String(checkbox.checked));

  if (checkbox.checked) showErr('terms', '');
}


/* ── 11. Progress Indicator ──
   Updates step dots and the label below them.
   ─────────────────────────────────────────── */
function updateProgress(panel) {
  const stepLabels = ['', 'Personal Info', 'Account Setup', 'Final Details'];
  document.getElementById('progressLabel').textContent =
    `Step ${panel} of ${TOTAL_PANELS} — ${stepLabels[panel]}`;

  for (let i = 1; i <= TOTAL_PANELS; i++) {
    const dot = document.getElementById('dot-' + i);
    dot.className = 'step-dot' +
      (i < panel  ? ' done'   :
       i === panel ? ' active' : '');
    dot.innerHTML = i < panel
      ? '<i class="ti ti-check" style="font-size:12px;"></i>'
      : String(i);
  }

  for (let i = 1; i < TOTAL_PANELS; i++) {
    document.getElementById('line-' + i).className =
      'step-line' + (i < panel ? ' done' : '');
  }
}


/* ── 12. Panel Navigation ── */

/**
 * Validates the current panel and advances to the next.
 * FIX: After moving to a new panel, focus is set on the first
 * input in that panel so keyboard/screen-reader users are oriented.
 */
function goNext(fromPanel) {
  const fields = panelFields[fromPanel];
  let allValid = true;

  fields.forEach((id) => {
    if (!validateField(id)) allValid = false;
  });

  if (!allValid) {
    /* Shake the first invalid field to draw attention */
    const firstInvalid = document.querySelector(
      '#panel-' + fromPanel + ' input.invalid, #panel-' + fromPanel + ' select.invalid'
    );
    if (firstInvalid) {
      firstInvalid.style.animation = 'none';
      requestAnimationFrame(() => {
        firstInvalid.style.animation = 'shake 0.4s ease';
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    return;
  }

  showPanel(fromPanel + 1);
}

function goBack(fromPanel) {
  showPanel(fromPanel - 1);
}

/**
 * Switches the visible panel.
 * FIX: Moves keyboard focus to the first focusable element
 * in the new panel so keyboard users aren't left behind.
 */
function showPanel(n) {
  document.getElementById('panel-' + currentPanel).classList.remove('active');
  currentPanel = n;
  const nextPanel = document.getElementById('panel-' + n);
  nextPanel.classList.add('active');
  updateProgress(n);

  /* Focus first input in new panel — keyboard accessibility fix */
  const firstInput = nextPanel.querySelector('input, select, textarea, button');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 50); /* small delay lets CSS transition finish */
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ── 13. Form Submit ── */
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  /* Validate all panel 3 fields */
  let allValid = true;
  panelFields[3].forEach((id) => {
    if (!validateField(id)) allValid = false;
  });

  /* Validate terms checkbox */
  if (!document.getElementById('terms').checked) {
    showErr('terms', 'You must accept the terms to continue.');
    allValid = false;
  }

  if (!allValid) return;

  /* Show loading state on button */
  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');

  /* Simulate async API call (replace with real fetch() in production) */
  setTimeout(() => {
    btn.classList.remove('loading');

    /* Build and show the success overlay */
    const name  = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;
    const role  = document.getElementById('role').value;

    const pills = document.getElementById('summaryPills');
    pills.innerHTML = [name, email, role]
      .map((text) => `<span class="pill">${text}</span>`)
      .join('');

    document.getElementById('successOverlay').classList.add('show');
  }, 2000);
});


/* ── 14. Form Reset ──
   Clears all fields, validation states, and returns to panel 1.
   ─────────────────────────────────────────────────────────────── */
function resetForm() {
  document.getElementById('registerForm').reset();
  document.getElementById('successOverlay').classList.remove('show');

  /* Remove all validation classes */
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    el.classList.remove('valid', 'invalid');
  });

  /* Clear all error messages */
  document.querySelectorAll('.error-msg').forEach((el) => {
    el.textContent = '';
    el.classList.remove('show');
  });

  /* Clear all status icons */
  document.querySelectorAll('.status-icon').forEach((el) => {
    el.className = 'status-icon';
    el.innerHTML = '';
  });

  /* Reset strength meter */
  for (let i = 1; i <= 4; i++) {
    document.getElementById('seg-' + i).style.background = 'rgba(255,255,255,0.08)';
  }
  document.getElementById('strengthText').textContent = '';

  /* Reset character counter */
  document.getElementById('charCount').textContent = '0 / 200';

  /* Reset custom checkbox */
  document.getElementById('checkboxUi').classList.remove('checked');
  document.getElementById('termsRow').setAttribute('aria-checked', 'false');

  /* Return to first panel */
  showPanel(1);
}
