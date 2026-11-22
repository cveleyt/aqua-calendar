// ==UserScript==
// @name         AQUA Calendar popup
// @namespace    https://cveleyt.github.io/aqua-calendar/
// @version      1.1
// @description  Small popup on Torn with the next AQUA faction events and the current war. Reads the AQUA calendar sheet. Does not click or automate anything on Torn.
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      docs.google.com
// @connect      googleusercontent.com
// @run-at       document-idle
// @updateURL    https://cveleyt.github.io/aqua-calendar/aqua-calendar.user.js
// @downloadURL  https://cveleyt.github.io/aqua-calendar/aqua-calendar.user.js
// ==/UserScript==
(function () {
  'use strict';
  if (window.top !== window.self) return;
  var SHEET_ID = '1JG7l4QcNfQLfRkW4-JgNQ2blAUtSU3gzZEZJN8LOsC8';
  var PAGE = 'https://cveleyt.github.io/aqua-calendar/';
  var MAX_ROWS = 6, CACHE_MS = 2 * 60 * 1000;
  var COLORS = {Red:'#AE4541',Orange:'#A85A18',Gold:'#8F7200',Green:'#387D4E',Teal:'#2C7C7C',Blue:'#3A6CB5',Purple:'#794DB3',Pink:'#AB4680',Brown:'#7A5230',Slate:'#556A7B'};
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function url(sheet, range) {
    return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?headers=0&tqx=out:csv&sheet=' + encodeURIComponent(sheet) + '&range=' + range + '&_=' + Date.now();
  }
  function get(u) {
    return new Promise(function (res, rej) {
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({ method: 'GET', url: u, timeout: 15000, onload: function (r) { r.status === 200 ? res(r.responseText) : rej(new Error('HTTP ' + r.status)); }, onerror: function () { rej(new Error('network')); }, ontimeout: function () { rej(new Error('timeout')); } });
      } else if (typeof PDA_httpGet === 'function') {
        PDA_httpGet(u).then(function (r) { res(r.responseText); }, rej);
      } else { fetch(u).then(function (r) { return r.text(); }).then(res, rej); }
    });
  }
  function csv(t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function dayIdx(y, m, d) { return Math.floor(Date.UTC(y, m, d) / 86400000); }
  function fmt(i) { var d = new Date(i * 86400000); return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON3[d.getUTCMonth()]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function parse(evRows, warRows) {
    var n = new Date(), today = dayIdx(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    var warPanel = warRows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
    var status = ((warPanel[2] || [])[0] || '').trim().toUpperCase();
    var done = status === 'CAP MET' || status === 'WAR OVER';
    var out = [];
    evRows.forEach(function (r) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((r[0] || '').trim()); if (!m) return;
      var s = dayIdx(+m[1], +m[2] - 1, +m[3]), e = s, b = /^(\d{4})-(\d{2})-(\d{2})$/.exec((r[1] || '').trim());
      if (b) { var ee = dayIdx(+b[1], +b[2] - 1, +b[3]); if (ee > s) e = ee; }
      var title = (r[2] || '').trim(), time = r[3] || '', arch = time.indexOf('​') >= 0, war = title.indexOf('⚔') === 0;
      time = time.replace(/​/g, '').trim();
      if (arch || e < today) return;
      var col = war ? (done ? COLORS.Slate : COLORS.Red) : (COLORS[(r[5] || '').trim()] || COLORS.Green);
      out.push({ s: s, e: e, title: title, time: time, host: (r[4] || '').trim(), color: col, war: war });
    });
    out.sort(function (a, b) { return a.s - b.s || a.e - b.e; });
    var teams = ((warPanel[0] || [])[0] || '').split('\n')[0], opp = ((warPanel[0] || [])[2] || '').split('\n')[0];
    return { today: today, events: out.slice(0, MAX_ROWS), war: warPanel.length ? { vs: teams + ' vs ' + opp, date: (warPanel[1] || [])[0] || '', status: status, type: (warPanel[2] || [])[1] || '' } : null };
  }
  function load(force) {
    var cached = null;
    try { cached = JSON.parse(GM_getValue('aquaCal', 'null')); } catch (e) {}
    if (!force && cached && Date.now() - cached.t < CACHE_MS) return Promise.resolve(cached.d);
    return Promise.all([get(url('Events', 'A2:F81')), get(url('Calendar', 'I4:K9'))]).then(function (a) {
      var d = parse(csv(a[0]), csv(a[1]));
      try { GM_setValue('aquaCal', JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
      return d;
    });
  }

  var css = '' +
    '#aqc-btn{position:fixed;right:14px;bottom:70px;z-index:99998;width:44px;height:44px;border-radius:50%;background:#10303a;border:2px solid #5fb3b3;color:#9fe0e0;font:800 11px Arial,sans-serif;letter-spacing:.5px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.5);padding:0}' +
    '#aqc-pop{--bg:#0f1c25;--hd:#16303c;--card:#15262f;--line:#233a49;--tx:#e8f0f4;--mut:#8da3b1;--acc:#f2c14e;--teal:#7fd0d0;--chip:#1d3646;' +
    'position:fixed;right:14px;bottom:120px;z-index:99999;width:330px;max-width:calc(100vw - 28px);max-height:calc(100vh - 150px);overflow:auto;background:var(--bg);color:var(--tx);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.55);font:13px/1.3 Arial,sans-serif;display:none}' +
    '#aqc-pop.light{--bg:#f4f8fb;--hd:#e3edf3;--card:#ffffff;--line:#d3dee6;--tx:#14212b;--mut:#587083;--acc:#a86b00;--teal:#1f6f7d;--chip:#e6eef4;box-shadow:0 10px 30px rgba(30,60,80,.3)}' +
    '#aqc-pop *{box-sizing:border-box}' +
    '#aqc-pop .h{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--hd);border-bottom:1px solid var(--line)}' +
    '#aqc-pop .h .ti{flex:1;font-weight:800;letter-spacing:.16em;font-size:11px;color:var(--teal)}' +
    '#aqc-pop .tg{width:26px;height:26px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--tx);cursor:pointer;padding:0;font-size:13px;line-height:1}' +
    '#aqc-pop .sec{padding:10px 12px 4px;font-size:10px;letter-spacing:.18em;font-weight:700;color:var(--mut)}' +
    '#aqc-pop .war{margin:0 12px 6px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card)}' +
    '#aqc-pop .war .vs{display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:15px}' +
    '#aqc-pop .war .vs i{font-style:normal;color:var(--acc);font-size:11px}' +
    '#aqc-pop .war .dt{text-align:center;color:var(--mut);font-size:12px;margin-top:4px}' +
    '#aqc-pop .chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px}' +
    '#aqc-pop .chip{font-size:10px;font-weight:800;letter-spacing:.05em;padding:3px 8px;border-radius:5px;background:var(--chip);color:var(--tx)}' +
    '#aqc-pop .chip.s{background:#556a7b;color:#fff}#aqc-pop .chip.up{background:#365e94;color:#fff}#aqc-pop .chip.on{background:#ae3a3f;color:#fff}#aqc-pop .chip.t{background:#bc4214;color:#fff}' +
    '#aqc-pop .list{padding:2px 12px 12px}' +
    '#aqc-pop .ev{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;padding:8px 10px;margin-top:6px;border:1px solid var(--line);border-left:4px solid var(--c);border-radius:9px;background:var(--card)}' +
    '#aqc-pop .ev .dd{text-align:center;line-height:1}#aqc-pop .ev .dd b{display:block;font-size:18px}#aqc-pop .ev .dd span{font-size:9px;letter-spacing:.12em;color:var(--mut);font-weight:700}' +
    '#aqc-pop .ev .nm{font-weight:700;font-size:13px}' +
    '#aqc-pop .ev .nm small{display:block;margin-top:2px;font-weight:400;font-size:11px;color:var(--mut)}' +
    '#aqc-pop .ev .wh{font-size:10px;font-weight:700;color:var(--acc);white-space:nowrap;text-align:right}' +
    '#aqc-pop .m{padding:16px;text-align:center;color:var(--mut)}' +
    '#aqc-pop .f{padding:8px 12px;border-top:1px solid var(--line);text-align:center;background:var(--hd)}' +
    '#aqc-pop .f a{color:var(--acc);font-weight:700;text-decoration:none;font-size:12px}';

  var MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  function ui() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'aqc-btn'; b.textContent = 'AQUA'; b.title = 'AQUA calendar: next events';
    var p = document.createElement('div'); p.id = 'aqc-pop';
    document.body.appendChild(b); document.body.appendChild(p);
    var light = false;
    try { light = GM_getValue('aquaTheme', 'dark') === 'light'; } catch (e) {}
    var last = null;
    function theme() { p.classList.toggle('light', light); }
    function chipCls(t) { t = (t || '').toUpperCase(); return t === 'UPCOMING' ? 'up' : t === 'ONGOING' ? 'on' : 's'; }
    function draw(d) {
      last = d;
      var h = '<div class="h"><span class="ti">AQUA CALENDAR</span><button class="tg" id="aqc-tg" title="Dark / light mode">' + (light ? '☾' : '☀') + '</button></div>';
      if (d.war) {
        var vs = d.war.vs.split(' vs ');
        h += '<div class="sec">RANKED WAR</div><div class="war"><div class="vs"><span>' + esc(vs[0]) + '</span><i>VS</i><span>' + esc(vs[1] || '') + '</span></div><div class="dt">' + esc(d.war.date) + '</div><div class="chips">' +
          (d.war.status ? '<span class="chip ' + chipCls(d.war.status) + '">' + esc(d.war.status) + '</span>' : '') +
          (d.war.type ? '<span class="chip ' + (/TERMED/i.test(d.war.type) ? 't' : '') + '">' + esc(d.war.type) + '</span>' : '') + '</div></div>';
      }
      h += '<div class="sec">NEXT EVENTS</div><div class="list">';
      if (!d.events.length) h += '<div class="m">No upcoming events</div>';
      d.events.forEach(function (e) {
        var diff = e.s - d.today, when = diff <= 0 ? 'NOW' : (diff === 1 ? 'TOMORROW' : 'IN ' + diff + ' DAYS');
        var dt = new Date(e.s * 86400000), meta = [];
        if (e.e > e.s) meta.push('to ' + fmt(e.e));
        if (e.time) meta.push(e.time);
        if (e.host && !e.war) meta.push('Host: ' + e.host);
        h += '<div class="ev" style="--c:' + e.color + '"><div class="dd"><b>' + dt.getUTCDate() + '</b><span>' + MON[dt.getUTCMonth()] + ' ' + DAYS[dt.getUTCDay()].toUpperCase() + '</span></div><div class="nm">' + esc(e.title) + (meta.length ? '<small>' + esc(meta.join(' | ')) + '</small>' : '') + '</div><div class="wh">' + when + '</div></div>';
      });
      h += '</div><div class="f"><a href="' + PAGE + '" target="_blank" rel="noopener">Open full calendar</a></div>';
      p.innerHTML = h; theme();
    }
    function open() {
      p.style.display = 'block'; theme(); p.innerHTML = '<div class="m">Loading...</div>';
      load(false).then(draw, function (e) { p.innerHTML = '<div class="m">Could not load the calendar (' + esc(e.message) + ')</div>'; });
    }
    p.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (ev.target && ev.target.id === 'aqc-tg') { light = !light; try { GM_setValue('aquaTheme', light ? 'light' : 'dark'); } catch (e) {} if (last) draw(last); else theme(); }
    });
    b.addEventListener('click', function (ev) { ev.stopPropagation(); if (p.style.display === 'block') p.style.display = 'none'; else open(); });
    document.addEventListener('click', function (ev) { if (p.style.display === 'block' && !p.contains(ev.target) && ev.target !== b) p.style.display = 'none'; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') p.style.display = 'none'; });
  }
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);

  window.__aquaParse = parse; window.__aquaCsv = csv;
})();
