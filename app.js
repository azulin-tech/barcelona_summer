/* ================================================
   Barcelona Summer — app.js  v4
   ================================================ */

const SHEET_ID = '1jDSAOSVUoxDcu1rJLULk2_5IY9zfcNk0axT0wBaskw0';

const PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

/* ── Languages ───────────────────────────────── */
const LANGUAGES = [
    { code: 'es',    label: 'Español',    flag: '🇪🇸', gtCode: 'es'    },
    { code: 'ca',    label: 'Català',     flag: '🏴',  gtCode: 'ca'    },
    { code: 'en',    label: 'English',    flag: '🇬🇧', gtCode: 'en'    },
    { code: 'fr',    label: 'Français',   flag: '🇫🇷', gtCode: 'fr'    },
    { code: 'de',    label: 'Deutsch',    flag: '🇩🇪', gtCode: 'de'    },
    { code: 'pt',    label: 'Português',  flag: '🇵🇹', gtCode: 'pt'    },
    { code: 'it',    label: 'Italiano',   flag: '🇮🇹', gtCode: 'it'    },
    { code: 'nl',    label: 'Nederlands', flag: '🇳🇱', gtCode: 'nl'    },
    { code: 'pl',    label: 'Polski',     flag: '🇵🇱', gtCode: 'pl'    },
    { code: 'sv',    label: 'Svenska',    flag: '🇸🇪', gtCode: 'sv'    },
    { code: 'da',    label: 'Dansk',      flag: '🇩🇰', gtCode: 'da'    },
    { code: 'fi',    label: 'Suomi',      flag: '🇫🇮', gtCode: 'fi'    },
    { code: 'el',    label: 'Ελληνικά',   flag: '🇬🇷', gtCode: 'el'    },
    { code: 'ro',    label: 'Română',     flag: '🇷🇴', gtCode: 'ro'    },
    { code: 'hu',    label: 'Magyar',     flag: '🇭🇺', gtCode: 'hu'    },
    { code: 'cs',    label: 'Čeština',    flag: '🇨🇿', gtCode: 'cs'    },
    { code: 'zh-TW', label: '中文',       flag: '🇨🇳', gtCode: 'zh-TW' },
    { code: 'ko',    label: '한국어',      flag: '🇰🇷', gtCode: 'ko'    },
    { code: 'vi',    label: 'Tiếng Việt', flag: '🇻🇳', gtCode: 'vi'    },
    { code: 'fil',   label: 'Filipino',   flag: '🇵🇭', gtCode: 'fil'   },
];

let activeLang = 'zh-TW';

/* ── Language Selector ───────────────────────── */
function buildLangMenu() {
    const menu  = document.getElementById('lang-menu');
    const btn   = document.getElementById('lang-btn');
    const sel   = document.getElementById('lang-selector');

    const inner = document.createElement('div');
    inner.className = 'lang-menu-inner';

    LANGUAGES.forEach((lang, idx) => {
        if (idx === 16) {
            const div = document.createElement('div');
            div.className = 'lang-menu-divider';
            inner.appendChild(div);
        }
        const opt = document.createElement('button');
        opt.className = 'lang-option' + (lang.code === activeLang ? ' active' : '');
        opt.dataset.code = lang.code;
        opt.innerHTML = `
            <span class="lang-flag">${lang.flag}</span>
            <span class="lang-name">${lang.label}</span>
            <span class="lang-code">${lang.code.toUpperCase()}</span>`;
        opt.addEventListener('click', () => {
            selectLanguage(lang.code, lang.gtCode, opt);
            closeMenu();
        });
        inner.appendChild(opt);
    });
    menu.appendChild(inner);

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = sel.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
    });
    document.addEventListener('click', e => {
        if (!sel.contains(e.target)) closeMenu();
    });

    function closeMenu() {
        sel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }
}

function selectLanguage(code, gtCode, optEl) {
    activeLang = code;
    document.getElementById('lang-current').textContent = code.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
    if (optEl) optEl.classList.add('active');
    applyGoogleTranslate(gtCode);
}

function applyGoogleTranslate(gtCode) {
    const tryApply = (n) => {
        const sel = document.querySelector('.goog-te-combo');
        if (sel) { sel.value = gtCode; sel.dispatchEvent(new Event('change')); }
        else if (n > 0) setTimeout(() => tryApply(n - 1), 300);
    };
    tryApply(10);
}

/* ── Fetch helpers ───────────────────────────── */
async function fetchWithFallback(sheetName) {
    const cacheBust = Math.random().toString(36).substring(7);
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&cachebust=${cacheBust}`;
    try { const r = await fetch(url); if (r.ok) return r; } catch (_) {}
    for (const proxy of PROXIES) {
        try { const r = await fetch(proxy(url)); if (r.ok) return r; } catch (_) {}
    }
    throw new Error(`All fetch attempts failed for: ${sheetName}`);
}

/* ── Image helpers ───────────────────────────── */
function fixImageUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (url.includes('drive.google.com')) {
        let id = '';
        if (url.includes('/d/'))   id = url.split('/d/')[1].split('/')[0];
        else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
        return id ? `https://lh3.googleusercontent.com/u/0/d/${id}` : url;
    }
    return url;
}

function parseDescription(text) {
    if (!text) return '';
    return text.replace(/<photo>(.*?)<\/photo>/g,
        (_, u) => `<img src="${fixImageUrl(u)}" class="inline-photo" loading="lazy">`);
}

/* ── Date helper (sorting only — never displayed) */
function parseDate(str) {
    if (!str || !str.trim()) return null;
    const p = str.split('/');
    return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : new Date(str);
}

/* ── Steps parser ─────────────────────────────
   Supports two formats from the sheet:
   1. Quoted CSV:  "底层垫冰", "铺紫苏叶", "厚切三文鱼"
   2. Pipe-sep:    底层垫冰 | 铺紫苏叶 | 厚切三文鱼
   ─────────────────────────────────────────────── */
function parseSteps(raw) {
    if (!raw || !raw.trim()) return [];

    // Try quoted-string format first: extract anything between double quotes
    const quoted = [...raw.matchAll(/"([^"]+)"/g)].map(m => m[1].trim()).filter(Boolean);
    if (quoted.length) return quoted;

    // Fallback: pipe-separated
    return raw.split('|').map(s => s.trim()).filter(Boolean);
}

/* ── Hero helpers ────────────────────────────── */
function showHero(which, title, subtitle, imgUrl, eyebrow) {
    const heroHome = document.getElementById('hero-home');
    const heroSub  = document.getElementById('hero-sub');

    if (which === 'home') {
        heroHome.classList.add('active');
        heroSub.classList.remove('active');
    } else {
        heroHome.classList.remove('active');
        heroSub.classList.add('active');
        document.getElementById('page-h1').textContent       = (title  || '').toUpperCase();
        document.getElementById('page-subtitle').textContent = subtitle || '';
        heroSub.style.backgroundImage = imgUrl ? `url(${imgUrl})` : '';
    }
}

/* ── Menu loading ─────────────────────────────
   Reads Sections sheet and builds the full-screen nav.
   Columns used: Name, Status, En, Subtitle, Imagen,
                 "Section subtitle"  ← new column shown in menu
   ─────────────────────────────────────────────── */
async function loadMenu() {
    const container = document.getElementById('dynamic-menu');
    try {
        const res = await fetchWithFallback('Sections');
        Papa.parse(await res.text(), {
            header: true,
            complete({ data }) {
                container.innerHTML = '';
                data.forEach(sec => {
                    const name   = (sec.Name || '').trim();
                    const status = (sec.Status || '').toLowerCase();
                    const enName = (sec.En || '').trim();
                    // "Section subtitle" column shown below the name in the overlay
                    const menuSub = (sec['Section subtitle'] || sec['Menu subtitle'] || enName).trim();

                    if (status !== 'on') return;

                    const a = document.createElement('a');
                    a.href      = `index.html?section=${encodeURIComponent(name)}`;
                    a.className = 'menu-item';
                    a.innerHTML = `
                        <span class="menu-item-title">${name}</span>
                        ${menuSub ? `<span class="menu-item-sub">${menuSub}</span>` : ''}`;
                    container.appendChild(a);
                });
            }
        });
    } catch (e) { console.error('Menu load error', e); }
}

/* ── Home — just shows the hero video, no posts ─ */
function loadHome() {
    showHero('home');
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.style.display = 'none';   // kill the white gap entirely
    document.getElementById('main-footer').style.marginTop = '0';
}

/* ── Section page ────────────────────────────── */
async function loadSection(name) {
    const container = document.getElementById('content');
    container.style.display = '';   // restore after home hid it
    container.innerHTML = '<div class="loader">Cargando sección… ≈</div>';
    showHero('sub', name, '', null, 'Sección');

    try {
        // Section metadata
        const secRes  = await fetchWithFallback('Sections');
        const secData = Papa.parse(await secRes.text(), { header: true }).data;
        const meta    = secData.find(s => (s.Name || '').trim() === name) || {};

        const subtitle = (meta.Subtitle || meta.Subtitulo || '').trim();
        const heroImg  = fixImageUrl((meta.Image || meta.Imagen || '').trim());

        // Posts
        const res  = await fetchWithFallback(name);
        const data = Papa.parse(await res.text(), { header: true }).data;

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const final = data
            .filter(p => {
                const d = parseDate(p.Date || p.Fecha);
                return (p.Title || p.Titulo) && d && d <= today;
            })
            .sort((a, b) => parseDate(b.Date || b.Fecha) - parseDate(a.Date || a.Fecha));

        // Hero background: Sections sheet image → first post cover
        let bgImg = heroImg;
        if (!bgImg) {
            const first = final.find(p => p['Cover Photo'] || p['Foto Portada']);
            if (first) bgImg = fixImageUrl(first['Cover Photo'] || first['Foto Portada']);
        }

        showHero('sub', name, subtitle, bgImg, 'Sección');
        renderPosts(final, container, name);
    } catch (e) {
        container.innerHTML = '<p class="empty-state">Error al cargar los posts.</p>';
    }
}

/* ── Render Posts ─────────────────────────────── */
function renderPosts(data, container, label) {
    container.innerHTML = '';

    if (!data.length) {
        container.innerHTML = '<p class="empty-state">No hay publicaciones disponibles aún.</p>';
        return;
    }

    if (label) {
        const lbl = document.createElement('p');
        lbl.className = 'section-label';
        lbl.textContent = label;
        container.appendChild(lbl);
    }

    data.forEach((row, i) => {
        const title   = row.Title  || row.Titulo      || '';
        const desc    = parseDescription(row.Description || row.Descripcion || '');
        const cover   = fixImageUrl(row['Cover Photo'] || row['Foto Portada'] || '');
        const tipRaw  = (row.Tip || row.Tips || row.Nota || '').trim();
        const steps   = parseSteps(row.Steps || row.Pasos || '');

        const photos = [];
        for (let j = 1; j <= 20; j++) {
            const p = row[`Photo ${j}`] || row[`Foto ${j}`];
            if (p) photos.push(fixImageUrl(p));
        }

        /* Steps HTML */
        let stepsHtml = '';
        if (steps.length) {
            stepsHtml = `<ul class="item-steps">${
                steps.map((s, n) =>
                    `<li><span class="step-num">${n + 1}.</span>${s}</li>`
                ).join('')
            }</ul>`;
        }

        /* Tip HTML */
        const tipHtml = tipRaw
            ? `<div class="item-note">
                   <p class="item-note-label">Note</p>
                   <p class="item-note-text">${tipRaw}</p>
               </div>`
            : '';

        /* Image HTML */
        const imageHtml = cover
            ? `<img src="${cover}" class="item-cover" alt="${title}" loading="lazy">`
            : `<div class="image-placeholder">≈</div>`;

        const rowEl = document.createElement('div');
        rowEl.className = `item-row${i % 2 !== 0 ? ' reverse' : ''}`;
        rowEl.innerHTML = `
            <div class="item-image-box">
                <div class="image-frame">${imageHtml}</div>
            </div>
            <div class="item-info">
                <span class="item-num">${String(i + 1).padStart(2, '0')}.</span>
                <h2 class="item-title">${title}</h2>
                <div class="item-divider"></div>
                ${desc    ? `<div class="item-desc">${desc}</div>` : ''}
                ${stepsHtml}
                ${tipHtml}
            </div>`;
        container.appendChild(rowEl);

        /* Carousel */
        if (photos.length) {
            const cId  = `c-${i}`;
            const wrap = document.createElement('div');
            wrap.className = 'carousel-wrap';
            wrap.innerHTML = `
                <p class="carousel-label">Galería fotográfica</p>
                <div class="carousel-container" id="${cId}">
                    <div class="carousel-slides">
                        ${photos.map(p =>
                            `<div class="carousel-slide"><img src="${p}" alt="" loading="lazy"></div>`
                        ).join('')}
                    </div>
                    ${photos.length > 1 ? `
                        <button class="carousel-btn prev" onclick="moveSlide('${cId}',-1,${photos.length})" aria-label="Anterior">❮</button>
                        <button class="carousel-btn next" onclick="moveSlide('${cId}',1,${photos.length})" aria-label="Siguiente">❯</button>
                    ` : ''}
                </div>`;
            container.appendChild(wrap);
        }

        /* Separator */
        if (i < data.length - 1) {
            const sep = document.createElement('div');
            sep.className = 'post-separator';
            container.appendChild(sep);
        }
    });

    /* Scroll-reveal */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
    }, { threshold: 0.08 });
    container.querySelectorAll('.item-row').forEach(el => observer.observe(el));
}

/* ── Carousel state ──────────────────────────── */
const cState = {};
function moveSlide(id, d, t) {
    cState[id] = ((cState[id] || 0) + d + t) % t;
    const slides = document.querySelector(`#${id} .carousel-slides`);
    if (slides) slides.style.transform = `translateX(-${cState[id] * 100}%)`;
}

/* ── Header scroll effect ────────────────────── */
function initHeader() {
    const header   = document.getElementById('main-header');
    const heroHome = document.getElementById('hero-home');
    const update   = () => {
        const onVideo   = heroHome.classList.contains('active');
        const threshold = onVideo ? 80 : 20;
        header.classList.toggle('scrolled', window.scrollY > threshold);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ── Hamburger menu ──────────────────────────── */
function initMenu() {
    const toggle   = document.getElementById('menu-toggle');
    const overlay  = document.getElementById('menu-overlay');
    const header   = document.getElementById('main-header');

    const open = () => {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        header.classList.add('menu-open');   // keeps logo dark & readable
        document.body.style.overflow = 'hidden';
    };
    const close = () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        header.classList.remove('menu-open');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () =>
        overlay.classList.contains('active') ? close() : open()
    );
    // Close when a section link is clicked
    overlay.addEventListener('click', e => {
        if (e.target.closest('a.menu-item')) close();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });
}

/* ── Init ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMenu();
    buildLangMenu();
    loadMenu();

    const params  = new URLSearchParams(window.location.search);
    const section = params.get('section');

    if (section) loadSection(section);
    else          loadHome();
});
