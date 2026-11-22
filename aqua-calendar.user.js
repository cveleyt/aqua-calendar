// ==UserScript==
// @name         AQUA Calendar popup
// @namespace    https://cveleyt.github.io/aqua-calendar/
// @version      1.0
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

  var css = '#aqc-btn{position:fixed;right:14px;bottom:70px;z-index:99998;width:42px;height:42px;border-radius:50%;background:#10303a;border:2px solid #5fb3b3;color:#9fe0e0;font:700 11px Arial;letter-spacing:.5px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.5);padding:0}' +
    '#aqc-pop{position:fixed;right:14px;bottom:120px;z-index:99999;width:300px;max-width:calc(100vw - 28px);background:#101e27;border:1px solid #2f4658;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.6);font:13px Arial;color:#e8f0f4;display:none;overflow:hidden}' +
    '#aqc-pop .h{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#17303d;font-weight:700;letter-spacing:.12em;font-size:11px;color:#9fe0e0}' +
    '#aqc-pop .h a{color:#f2c14e;text-decoration:none;font-size:11px;letter-spacing:0}' +
    '#aqc-pop .w{padding:8px 10px;border-bottom:1px solid #1f3544;font-size:12px}' +
    '#aqc-pop .w b{display:block;margin-bottom:2px}#aqc-pop .w span{color:#8da3b1}' +
    '#aqc-pop table{width:100%;border-collapse:collapse}#aqc-pop td{padding:6px 8px;border-bottom:1px solid #1f3544;vertical-align:top}' +
    '#aqc-pop tr:last-child td{border:0}#aqc-pop .d{width:62px;color:#f2c14e;font-weight:700;font-size:12px;border-left:4px solid var(--c)}' +
    '#aqc-pop .t{font-weight:600}#aqc-pop .t small{display:block;color:#8da3b1;font-weight:400;font-size:11px}' +
    '#aqc-pop .m{padding:12px;color:#8da3b1;text-align:center}';

  function ui() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'aqc-btn'; b.textContent = 'AQUA'; b.title = 'AQUA calendar: next events';
    var p = document.createElement('div'); p.id = 'aqc-pop';
    document.body.appendChild(b); document.body.appendChild(p);
    function draw(d) {
      var h = '<div class="h"><span>AQUA CALENDAR</span><a href="' + PAGE + '" target="_blank" rel="noopener">Open full calendar</a></div>';
      if (d.war) h += '<div class="w"><b>' + esc(d.war.vs) + '</b><span>' + esc(d.war.date) + ' | ' + esc(d.war.status) + (d.war.type ? ' | ' + esc(d.war.type) : '') + '</span></div>';
      if (!d.events.length) h += '<div class="m">No upcoming events</div>';
      else h += '<table>' + d.events.map(function (e) {
        var diff = e.s - d.today, when = diff <= 0 ? 'now' : (diff === 1 ? 'tomorrow' : 'in ' + diff + ' days');
        return '<tr><td class="d" style="--c:' + e.color + '">' + esc(fmt(e.s).replace(/^(\w{3}) (\d+) (\w{3})$/, '$2 $3')) + '<small style="display:block;color:#8da3b1;font-weight:400;font-size:10px">' + esc(DAYS[new Date(e.s * 86400000).getUTCDay()]) + '</small></td><td class="t">' + esc(e.title) + '<small>' + esc((e.e > e.s ? 'to ' + fmt(e.e) + ' | ' : '') + (e.war ? e.time : (e.time || '')) + (e.host && !e.war ? (e.time ? ' | ' : '') + 'Host: ' + e.host : '') + (when ? (e.time || e.host || e.e > e.s ? ' | ' : '') + when : '')) + '</small></td></tr>';
      }).join('') + '</table>';
      p.innerHTML = h;
    }
    function open() {
      p.style.display = 'block'; p.innerHTML = '<div class="m">Loading...</div>';
      load(false).then(draw, function (e) { p.innerHTML = '<div class="m">Could not load the calendar (' + esc(e.message) + ')</div>'; });
    }
    b.addEventListener('click', function (ev) { ev.stopPropagation(); if (p.style.display === 'block') p.style.display = 'none'; else open(); });
    document.addEventListener('click', function (ev) { if (p.style.display === 'block' && !p.contains(ev.target)) p.style.display = 'none'; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') p.style.display = 'none'; });
  }
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);

  window.__aquaParse = parse; window.__aquaCsv = csv;
})();
