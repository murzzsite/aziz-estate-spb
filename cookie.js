/* Простая плашка cookie: запоминает выбор в localStorage */
(function () {
  var KEY = 'cookie-ok';
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}
  var me = document.currentScript || {};
  var ds = me.dataset || {};
  var ink = ds.ink || '#1c2a36', accent = ds.accent || '#1d78b0', onAccent = ds.onAccent || '#ffffff';
  var css = '.ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:0 auto;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 16px;background:#fff;color:' + ink + ';border:1px solid rgba(0,0,0,.14);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.14);font:400 14px/1.45 system-ui,-apple-system,"Segoe UI",Arial,sans-serif}' +
    '.ck p{margin:0;flex:1 1 240px}.ck a{color:inherit;text-decoration:underline}' +
    '.ck button{flex:none;min-height:40px;padding:0 18px;border:0;border-radius:10px;background:' + accent + ';color:' + onAccent + ';font:600 14px system-ui,-apple-system,"Segoe UI",Arial,sans-serif;cursor:pointer}' +
    '.ck button:focus-visible{outline:2px solid ' + ink + ';outline-offset:2px}';
  function show() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div'); box.className = 'ck'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Уведомление о cookie');
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('Сайт использует cookie и локальное хранилище браузера для работы страниц. Продолжая пользоваться сайтом, вы с этим соглашаетесь. '));
    var a = document.createElement('a'); a.href = 'privacy.html'; a.textContent = 'Подробнее'; p.appendChild(a);
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Понятно';
    b.addEventListener('click', function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} box.remove(); });
    box.appendChild(p); box.appendChild(b); document.body.appendChild(box);
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
