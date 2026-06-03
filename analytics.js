/* ================================================
   Olas & Calas — Analytics Tracker  v2
   GDPR / LOPD / LSSICE compliant:
   analytics only fires after explicit opt-in.

   HOW TO CONFIGURE:
     Replace APP_SCRIPT_URL with your deployed
     Google Apps Script web-app URL.
   ================================================ */

const APP_SCRIPT_URL = 'TU_WEBAPP_URL'; // ← paste here

/* ── Consent gate ────────────────────────────────
   Analytics only run if the user accepted cookies.
   Consent is stored in localStorage: oc_consent
   ─────────────────────────────────────────────── */
function analyticsAllowed() {
    try {
        const c = JSON.parse(localStorage.getItem('oc_consent') || '{}');
        return c.analytics === true;
    } catch (_) { return false; }
}

/* ── Session ID ──────────────────────────────── */
function generateSessionId() {
    return 'xxxxxxxyxxxxyxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

let sessionId = localStorage.getItem('oc_sessionId');
if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('oc_sessionId', sessionId);
}

let pageStartTime  = Date.now();
let currentSection = 'home';

/* ── Geo-location (IP-based, no extra permission) */
let cachedLocation = null;
async function getLocation() {
    if (cachedLocation) return cachedLocation;
    try {
        const res = await fetch('https://ipapi.co/json/');
        cachedLocation = await res.json();
    } catch (_) { cachedLocation = {}; }
    return cachedLocation;
}

/* ── Device / browser detection ─────────────── */
function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg'))     return 'Edge';
    if (ua.includes('Chrome'))  return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari'))  return 'Safari';
    if (ua.includes('OPR'))     return 'Opera';
    return 'Unknown';
}
function getDevice() {
    return /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)
        ? 'Mobile' : 'Desktop';
}

/* ── Core send ───────────────────────────────── */
async function sendAnalytics(section, event) {
    if (!analyticsAllowed()) return;
    if (!APP_SCRIPT_URL || APP_SCRIPT_URL === 'TU_WEBAPP_URL') return;

    const loc = await getLocation();
    const payload = {
        sessionId,
        page:      section || currentSection,
        event:     event   || 'pageview',
        timeSpent: Math.round((Date.now() - pageStartTime) / 1000),
        country:   loc.country_name || '',
        city:      loc.city         || '',
        browser:   getBrowser(),
        device:    getDevice(),
        language:  navigator.language,
        referrer:  document.referrer,
        screen:    `${screen.width}x${screen.height}`,
        userAgent: navigator.userAgent,
        consent:   'analytics_accepted',
    };

    try {
        navigator.sendBeacon(APP_SCRIPT_URL, JSON.stringify(payload));
    } catch (_) {
        fetch(APP_SCRIPT_URL, {
            method: 'POST', body: JSON.stringify(payload), keepalive: true,
        }).catch(() => {});
    }
}

/* ── SPA tracking ────────────────────────────── */
function trackSection(sectionName) {
    if (!analyticsAllowed()) return;
    if (currentSection) sendAnalytics(currentSection, 'section_exit');
    currentSection = sectionName || 'home';
    pageStartTime  = Date.now();
    sendAnalytics(currentSection, 'section_enter');
}

/* ── Heartbeat every 30 s ────────────────────── */
setInterval(() => { if (analyticsAllowed()) sendAnalytics(currentSection, 'heartbeat'); }, 30000);

/* ── Exit events ─────────────────────────────── */
window.addEventListener('pagehide',      () => sendAnalytics(currentSection, 'exit'));
window.addEventListener('beforeunload',  () => sendAnalytics(currentSection, 'exit'));

/* ── Menu-click tracking ─────────────────────── */
document.addEventListener('click', e => {
    const link = e.target.closest('a.menu-item');
    if (!link || !analyticsAllowed()) return;
    const dest = new URL(link.href, location.origin);
    sendAnalytics(dest.searchParams.get('section') || 'home', 'menu_click');
});

/* ── Initial hit ─────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
    const params  = new URLSearchParams(window.location.search);
    currentSection = params.get('section') || 'home';
    pageStartTime  = Date.now();
    sendAnalytics(currentSection, 'pageview');
});
