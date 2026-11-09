(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/FM65KP9HS4';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- load choreography ----------
  const go = () => root.classList.add('ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(() => setTimeout(go, 80));
  } else { setTimeout(go, 200); }

  // ---------- split headings into words ----------
  $$('.split').forEach(el => {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, i, arr) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      w.style.setProperty('--i', i);
      const s = document.createElement('span');
      s.textContent = word;
      w.appendChild(s);
      el.appendChild(w);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  const heroH1 = $('.hero h1');
  if (heroH1) heroH1.style.setProperty('--base', '450ms');

  // ---------- reveal targets (classes added here, never hardcoded) ----------
  const staggers = [
    ['.sec--head .statement', 0], ['.chap__body > *', 1], ['.calc__intro > *:not(h2)', 1], ['.calc__ui', 1],
    ['.why__head .statement', 0], ['.why__list li', 1], ['.faq__text > *:not(h2)', 1], ['.contact__text > *:not(h2)', 1],
    ['.form', 1], ['.band__t', 0], ['.band__s', 1], ['.row-head', 0], ['.col', 1], ['.hero__lead', 0], ['.hero__actions', 0]
  ];
  const rvEls = [];
  staggers.forEach(([sel, stepped]) => {
    $$(sel).forEach((el, i) => {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv');
      let d = stepped ? i : 0;
      if (el.matches('.hero__lead')) d = 6;
      if (el.matches('.hero__actions')) d = 8;
      el.style.setProperty('--d', d);
      rvEls.push(el);
    });
  });
  const watch = [...rvEls, ...$$('.split'), ...$$('.shutter')];

  // rAF visibility check: robust against fast scroll and jumps
  const header = $('#header');
  const heroImg = $('.hero__img');
  let ticking = false;
  const check = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;
    for (let i = watch.length - 1; i >= 0; i--) {
      const el = watch[i];
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) { el.classList.add('in'); watch.splice(i, 1); }
      else if (r.bottom <= 0) { el.classList.add('in'); watch.splice(i, 1); }
    }
    header.classList.toggle('is-solid', y > vh * 0.55 || header.classList.contains('menu-open'));
    if (heroImg && !reduce && y < vh * 1.3) heroImg.style.setProperty('--py', (y * 0.18).toFixed(1) + 'px');
    whyUpdate();
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);

  // ---------- burger ----------
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = open => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    req();
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ---------- smooth anchors ----------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (href === '#top' ? 0 : 56);
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ---------- phone mask ----------
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // ---------- calculator ----------
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const rub = n => fmt(n) + ' ₽';
  const els = {
    price: $('#c-price'), down: $('#c-down'), rate: $('#c-rate'), term: $('#c-term'),
    oPrice: $('#o-price'), oDown: $('#o-down'), oRate: $('#o-rate'), oTerm: $('#o-term'),
    pay: $('#r-pay'), diff: $('#r-diff'), fee: $('#r-fee')
  };
  const annuity = (loan, ratePct, years) => {
    const n = years * 12, r = ratePct / 1200;
    if (loan <= 0) return 0;
    return r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n));
  };
  const years = n => (n % 10 === 1 && n % 100 !== 11) ? 'год' : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) ? 'года' : 'лет';
  let shownPay = 0, tweenId = 0;
  const tweenPay = to => {
    cancelAnimationFrame(tweenId);
    if (reduce) { shownPay = to; els.pay.textContent = rub(to); return; }
    const from = shownPay, t0 = performance.now(), dur = 420;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      shownPay = from + (to - from) * (1 - Math.pow(1 - p, 3));
      els.pay.textContent = rub(shownPay);
      if (p < 1) tweenId = requestAnimationFrame(step);
    };
    tweenId = requestAnimationFrame(step);
  };
  const calc = () => {
    const price = parseFloat(els.price.value) * 1e6;
    const downPct = parseFloat(els.down.value);
    const rate = parseFloat(els.rate.value);
    const term = parseInt(els.term.value, 10);
    const loan = price * (1 - downPct / 100);
    const pay = annuity(loan, rate, term);
    const payLow = annuity(loan, Math.max(0, rate - 1), term);
    const kind = ($('input[name="kind"]:checked') || {}).value || 'new';

    els.oPrice.textContent = String(parseFloat(els.price.value)).replace('.', ',') + ' млн ₽';
    els.oDown.textContent = downPct + ' % · ' + rub(price * downPct / 100);
    els.oRate.textContent = String(rate).replace('.', ',') + ' %';
    els.oTerm.textContent = term + ' ' + years(term);
    [els.price, els.down, els.rate, els.term].forEach(inp => {
      const p = (inp.value - inp.min) / (inp.max - inp.min) * 100;
      inp.style.setProperty('--p', p + '%');
    });
    tweenPay(pay);
    els.diff.textContent = '−' + rub(pay - payLow) + ' в месяц';
    if (kind === 'sec') {
      const lo = Math.max(150000, price * 0.02), hi = Math.max(150000, price * 0.03);
      els.fee.textContent = lo === hi ? rub(lo) : rub(lo) + ' – ' + rub(hi);
    } else {
      els.fee.textContent = '0 ₽, платит ' + (kind === 'house' ? 'застройщик или подрядчик' : 'застройщик');
    }
  };
  $$('#calc-ui input').forEach(i => i.addEventListener('input', calc));
  calc();

  // ---------- "what's included": active statement ----------
  const whyItems = $$('#why-list li');
  function whyUpdate() {
    if (!whyItems.length) return;
    const mid = window.innerHeight * 0.5;
    let best = null, bd = Infinity;
    whyItems.forEach(li => {
      const r = li.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (r.bottom > 0 && r.top < window.innerHeight && d < bd) { bd = d; best = li; }
    });
    whyItems.forEach(li => li.classList.toggle('is-on', li === best));
  }

  // ---------- process row: buttons, bar, drag ----------
  const row = $('#row');
  const bar = $('#row-bar');
  if (row) {
    const upd = () => {
      const max = row.scrollWidth - row.clientWidth;
      const vis = row.clientWidth / row.scrollWidth;
      const p = max > 0 ? row.scrollLeft / max : 0;
      bar.style.width = (vis * 100 + (100 - vis * 100) * p) + '%';
    };
    row.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    const stepBy = dir => {
      const col = $('.col', row);
      const w = col.getBoundingClientRect().width + 32;
      row.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    $('#row-prev')?.addEventListener('click', () => stepBy(-1));
    $('#row-next')?.addEventListener('click', () => stepBy(1));
    row.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); }
    });
    let down = false, sx = 0, sl = 0, moved = false;
    row.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = row.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; row.classList.add('is-drag'); }
      row.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      row.classList.remove('is-drag');
    });
  }

  // ---------- footer picture: slow drift ----------
  const footImg = $('.foot__pic img');
  if (footImg && !reduce) {
    const drift = () => {
      const r = footImg.parentElement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
      footImg.style.transform = 'scale(' + (1.12 - 0.1 * p).toFixed(3) + ')';
    };
    window.addEventListener('scroll', () => requestAnimationFrame(drift), { passive: true });
    drift();
  }

  // ---------- form → Cloudflare Worker → Telegram ----------
  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn__t');
    const orig = label.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;

    $$('input', form).forEach(i => i.classList.remove('bad'));
    const phoneDigits = (payload.phone || '').replace(/\D/g, '');
    let bad = false;
    if (!payload.name || !payload.name.trim()) { form.elements.name.classList.add('bad'); bad = true; }
    if (phoneDigits.length < 11 && !(payload.telegram || '').trim()) { form.elements.phone.classList.add('bad'); bad = true; }
    if (bad) { label.textContent = 'Укажите имя и телефон'; setTimeout(() => { label.textContent = orig; }, 2500); return; }

    payload.contact = payload.phone || payload.telegram;
    payload.comment = 'Цель: ' + (payload.goal || '—') + (payload.budget ? '; бюджет: ' + payload.budget : '') + (payload.telegram ? '; Telegram: ' + payload.telegram : '');
    payload.source = 'aziz-estate-spb';

    btn.disabled = true;
    label.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      label.textContent = 'Заявка отправлена, Азиз скоро свяжется';
      form.reset();
    } catch (err) {
      console.error(err);
      label.textContent = 'Ошибка, напишите в Telegram';
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  req();
  setTimeout(req, 300);
})();
