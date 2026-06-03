/* ================================================
   Olas & Calas — Cookie Consent Manager  v2
   GDPR · LOPD-GDD · LSSICE · ePrivacy compliant
   ================================================ */

const CONSENT_VERSION = '1.0';
const CONSENT_KEY     = 'oc_consent';

function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); }
    catch (_) { return null; }
}

function saveConsent(analytics) {
    const record = {
        version:   CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        necessary: true,
        analytics: !!analytics,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    return record;
}

/* ── Close / hide modal ──────────────────────── */
function closeModal() {
    const modal    = document.getElementById('oc-consent-modal');
    const backdrop = document.getElementById('oc-backdrop');
    if (!modal) return;
    modal.classList.add('hiding');
    backdrop.classList.remove('visible');
    setTimeout(() => {
        modal.classList.remove('hiding', 'visible');
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    }, 380);
}

/* ── After consent: kick analytics if opted in ─ */
function postConsent(analytics) {
    if (analytics && typeof trackSection === 'function') {
        const params = new URLSearchParams(window.location.search);
        trackSection(params.get('section') || 'home');
    }
}

/* ── Accept all ──────────────────────────────── */
function consentAcceptAll() {
    saveConsent(true);
    closeModal();
    postConsent(true);
}

/* ── Necessary only ──────────────────────────── */
function consentNecessaryOnly() {
    saveConsent(false);
    closeModal();
    postConsent(false);
}

/* ── Save custom from toggles ────────────────── */
function consentSavePreferences() {
    const el        = document.getElementById('oc-toggle-analytics');
    const analytics = el ? el.checked : false;
    saveConsent(analytics);
    closeModal();
    postConsent(analytics);
}

/* ── Toggle preferences panel ────────────────── */
function togglePrefsPanel() {
    const prefs = document.getElementById('oc-prefs-panel');
    const btn   = document.getElementById('oc-prefs-toggle');
    if (!prefs) return;
    const open = !prefs.classList.contains('open');
    prefs.classList.toggle('open', open);
    btn.textContent = open ? 'Ocultar opciones' : 'Personalizar';
}

/* ── Re-open consent settings ────────────────── */
function openConsentSettings() {
    localStorage.removeItem(CONSENT_KEY);
    buildModal();
}

/* ── Build modal HTML ────────────────────────── */
function buildModal() {
    const existing = getConsent();
    if (existing && existing.version === CONSENT_VERSION) return;

    /* Remove any stale instance */
    document.getElementById('oc-consent-modal')?.remove();
    document.getElementById('oc-backdrop')?.remove();

    /* Backdrop */
    const backdrop = document.createElement('div');
    backdrop.id = 'oc-backdrop';
    document.body.appendChild(backdrop);

    /* Modal */
    const modal = document.createElement('div');
    modal.id = 'oc-consent-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'oc-title');

    modal.innerHTML = `
        <div class="oc-modal__bar"></div>
        <div class="oc-modal__body">
            <div class="oc-modal__head">
                <div class="oc-modal__icon">🍪</div>
                <h2 class="oc-modal__title" id="oc-title">Cookies <em>&</em> Privacidad</h2>
            </div>

            <p class="oc-modal__desc">
                Usamos cookies técnicas necesarias para el funcionamiento del sitio y,
                opcionalmente, cookies analíticas propias para mejorar el contenido.
                Nadie más accede a estos datos.
                <a href="privacidad.html" target="_blank">Política de privacidad</a> ·
                <a href="cookies.html" target="_blank">Política de cookies</a>
            </p>

            <!-- Preferences panel (hidden by default) -->
            <div class="oc-prefs" id="oc-prefs-panel">
                <div class="oc-pref-row">
                    <div class="oc-pref-info">
                        <span class="oc-pref-name">Estrictamente necesarias</span>
                        <span class="oc-pref-desc">Recuerdan tu elección de cookies y el idioma. Siempre activas.</span>
                    </div>
                    <span class="oc-always-on">Siempre activas</span>
                </div>
                <div class="oc-pref-row">
                    <div class="oc-pref-info">
                        <span class="oc-pref-name">Analíticas</span>
                        <span class="oc-pref-desc">Conteo de visitas por sección. Sin datos identificativos. Solo en tu propio Google Sheet.</span>
                    </div>
                    <label class="oc-switch">
                        <input type="checkbox" id="oc-toggle-analytics" checked>
                        <span class="oc-switch-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Buttons -->
            <div class="oc-modal__actions">
                <div class="oc-modal__row">
                    <button class="oc-btn oc-btn--primary"    onclick="consentAcceptAll()">Aceptar todas</button>
                    <button class="oc-btn oc-btn--secondary"  onclick="consentNecessaryOnly()">Solo esenciales</button>
                </div>
                <div class="oc-modal__row" style="justify-content:space-between; align-items:center;">
                    <button class="oc-btn oc-btn--ghost" id="oc-prefs-toggle" onclick="togglePrefsPanel()">Personalizar</button>
                    <button class="oc-btn oc-btn--ghost" id="oc-save-prefs"
                        onclick="consentSavePreferences()"
                        style="display:none; color:var(--sea-dark); font-weight:700;">
                        Guardar preferencias →
                    </button>
                </div>
            </div>
        </div>
        <div class="oc-modal__footer">
            <p class="oc-modal__notice">Tus datos nunca se venden ni se comparten con terceros.</p>
        </div>`;

    document.body.appendChild(modal);

    /* Show save button when prefs open */
    modal.querySelector('#oc-prefs-toggle').addEventListener('click', () => {
        const saveBtn = modal.querySelector('#oc-save-prefs');
        const prefs   = modal.querySelector('#oc-prefs-panel');
        if (saveBtn) saveBtn.style.display = prefs.classList.contains('open') ? 'block' : 'none';
    });

    /* Animate in */
    requestAnimationFrame(() => {
        modal.style.display = '';
        backdrop.style.display = '';
        requestAnimationFrame(() => {
            modal.classList.add('visible');
            backdrop.classList.add('visible');
        });
    });
}

/* ── Init ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', buildModal);
