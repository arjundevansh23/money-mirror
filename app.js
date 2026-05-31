// ─────────────────────────────────────────
// app.js — Money Mirror
// Sections:
//   1. Config & Constants
//   2. Default Data
//   3. State (localStorage)
//   4. Utilities
//   5. Navigation
//   6. Render: Donut Chart
//   7. Render: Insights (Insights tab + Home sync)
//   8. Render: Expenses
//   9. Render: Category Cards
//  10. Render: Goals
//  11. CRUD: Expenses
//  12. CRUD: Goals
//  13. UI Helpers
//  14. Init
// ─────────────────────────────────────────


// ─── 1. CONFIG & CONSTANTS ───────────────

var INCOME = 55000;

var PEER = { Food: 7300, Transport: 5600, Shopping: 2500, Utilities: 1800, Lifestyle: 2000 };

var CAT_BG = {
  Food:'#f5e0d0', Transport:'#d8eaf5', Shopping:'#fff0c8',
  Living:'#ede5d8', Utilities:'#d4e8f2', Lifestyle:'#f0ddd8',
  Health:'#dff0e4', Finance:'#e8dcc8', Other:'#f0f0e8'
};
var CAT_ICON = {
  Food:'🍔', Transport:'🚗', Shopping:'🛍️', Living:'🏠',
  Utilities:'⚡', Lifestyle:'🎬', Health:'🏥', Finance:'💼', Other:'📦'
};
var CAT_CLS = {
  Food:'cat-food', Transport:'cat-transport', Shopping:'cat-shopping',
  Living:'cat-living', Utilities:'cat-utilities', Lifestyle:'cat-lifestyle',
  Health:'cat-health', Finance:'cat-finance', Other:'cat-living'
};
var CAT_SUBS = {
  Food:     [['Groceries','#c49a6c'],['Delivery','#e07840'],['Eating Out','#d4905c'],['Cafes','#f0c098']],
  Transport:[['Ride-hailing','#c8d0a8'],['Public Transport','#a0b878'],['Fuel','#d8e4b8'],['Maintenance','#e8f0d0']],
  Shopping: [['Clothing','#c090c0'],['Electronics','#9868a8'],['Home Items','#d8b8e0'],['Misc','#ecdde8']],
  Living:   [['Rent','#c49a6c'],['Maintenance','#d4b88a'],['Society','#e0ccaa'],['Supplies','#eddfc4']],
  Utilities:[['Electricity','#bdd8f0'],['Internet','#96c4e0'],['Water/Gas','#c8e8f8'],['Subs','#d8eff8']],
  Lifestyle:[['Entertainment','#e08898'],['Outings','#d06878'],['Self-care','#f0b0b8'],['Hobbies','#f8d8dc']],
  Health:   [['Gym','#60b080'],['Medicines','#88c8a0'],['Wellness','#b0dcc0'],['Medical','#d4eedd']],
  Finance:  [['Savings','#c49a6c'],['EMI','#d4b888'],['Investments','#e8d0a8'],['Taxes','#f0e4c8']],
  Other:    [['Misc','#c8c8b0'],['Gifts','#d8d8c0'],['Unknown','#e8e8d0'],['Other','#f0f0e0']]
};
var CAT_COLOR_DONUT = {
  Food:'#c49a6c', Transport:'#c8d0a8', Shopping:'#bdd8f0', Living:'#e8d5be',
  Utilities:'#f4b8c8', Lifestyle:'#d4b8d0', Health:'#a8d8b8', Finance:'#d4c8a0', Other:'#e4eabf'
};
var TABS = ['home','expenses','insights','invest','goals'];


// ─── 2. DEFAULT DATA ─────────────────────

function defExp() {
  return [
    {id:'e1', desc:'Swiggy — Butter chicken', amt:420,  cat:'Food',      subcat:'Delivery',        date:'2026-03-15', time:'12:30', icon:'🍗'},
    {id:'e2', desc:'Ola — Office commute',     amt:185,  cat:'Transport', subcat:'Ride-hailing',    date:'2026-03-15', time:'09:05', icon:'🚕'},
    {id:'e3', desc:'Amazon — Earphones',       amt:1299, cat:'Shopping',  subcat:'Electronics',     date:'2026-03-15', time:'08:10', icon:'🛒'},
    {id:'e4', desc:'Zomato — Biryani',         amt:340,  cat:'Food',      subcat:'Delivery',        date:'2026-03-14', time:'20:45', icon:'🍛'},
    {id:'e5', desc:'Netflix — Monthly',        amt:649,  cat:'Utilities', subcat:'Subs',            date:'2026-03-14', time:'00:00', icon:'📺'},
    {id:'e6', desc:'Cult.fit — Monthly pass',  amt:999,  cat:'Health',    subcat:'Gym',             date:'2026-03-14', time:'14:00', icon:'💪'},
    {id:'e7', desc:'Starbucks — Latte',        amt:380,  cat:'Food',      subcat:'Cafes',           date:'2026-03-13', time:'10:20', icon:'☕'},
    {id:'e8', desc:'Mumbai Metro',             amt:50,   cat:'Transport', subcat:'Public Transport', date:'2026-03-13', time:'09:00', icon:'🚇'},
    {id:'e9', desc:'Spotify Premium',          amt:119,  cat:'Utilities', subcat:'Subs',            date:'2026-03-13', time:'00:00', icon:'🎵'},
    {id:'e10',desc:'Myntra — Kurta',           amt:1599, cat:'Shopping',  subcat:'Clothing',        date:'2026-03-13', time:'19:30', icon:'👗'}
  ];
}

function defGoals() {
  return [
    {id:'g1', name:'Emergency fund',  icon:'🛡️', target:100000, saved:42000, date:'2026-06'},
    {id:'g2', name:'First investment', icon:'📈', target:25000,  saved:12000, date:'2026-04'},
    {id:'g3', name:'Trip to Bali',    icon:'🌴', target:60000,  saved:8500,  date:'2026-11'}
  ];
}


// ─── 3. STATE (localStorage) ─────────────

function loadState() {
  var e, g;
  try { e = JSON.parse(localStorage.getItem('mm2_exp'));   } catch(x) {}
  try { g = JSON.parse(localStorage.getItem('mm2_goals')); } catch(x) {}
  return { exp: e || defExp(), goals: g || defGoals() };
}

function saveState() {
  try {
    localStorage.setItem('mm2_exp',   JSON.stringify(S.exp));
    localStorage.setItem('mm2_goals', JSON.stringify(S.goals));
  } catch(x) {}
}

var S = loadState();
var eId = null, gId = null, extraOn = false;


// ─── 4. UTILITIES ────────────────────────

function uid() { return '_' + Math.random().toString(36).slice(2) + Date.now(); }

function inr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function fmt_lakhs(n) {
  if (n >= 100000) return '₹' + (Math.round(n / 10000) / 10).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'k';
  return inr(n);
}

function dayLbl(d) {
  var dt = new Date(d + 'T00:00:00');
  var td = new Date(); td.setHours(0,0,0,0);
  var yd = new Date(td); yd.setDate(td.getDate() - 1);
  var dd = new Date(dt); dd.setHours(0,0,0,0);
  var s  = dt.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  if (dd.getTime() === td.getTime()) return 'Today · ' + s;
  if (dd.getTime() === yd.getTime()) return 'Yesterday · ' + s;
  return s;
}

function sipFuture(monthly, years) {
  if (!monthly || monthly <= 0) return 0;
  var r = 0.12 / 12, n = years * 12;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
}

function catTotals() {
  var ct = {};
  S.exp.forEach(function(e) { ct[e.cat] = (ct[e.cat] || 0) + e.amt; });
  return ct;
}

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2200);
}


// ─── 5. NAVIGATION ───────────────────────

function nav(name) {
  TABS.forEach(function(t) {
    document.getElementById('tab-' + t).classList.toggle('on', t === name);
    var ni  = document.getElementById('nav-' + t);
    ni.classList.toggle('on', t === name);
    var dot = ni.querySelector('.ni-dot');
    var lbl = ni.querySelector('.lbl');
    var isActive = t === name;
    // dot: show when active, remove when not
    if (isActive && !dot) {
      var d = document.createElement('div');
      d.className = 'ni-dot';
      ni.appendChild(d);
    } else if (!isActive && dot) {
      dot.remove();
    }
    // label: hide when active, show when not
    if (lbl) lbl.style.display = isActive ? 'none' : 'block';
  });
  if (name === 'insights') renderInsights();
  window.scrollTo(0, 0);
}


// ─── 6. RENDER: DONUT CHART ──────────────

function renderDonut(ct, total) {
  var svg    = document.getElementById('donut-svg');
  var legend = document.getElementById('donut-legend');
  if (!svg || !legend) return;

  var CIRC = 207.3; // 2π × 33

  // Sort by amount desc, top 4 + Other
  var entries = Object.keys(ct)
    .map(function(k) { return { cat: k, amt: ct[k] }; })
    .sort(function(a, b) { return b.amt - a.amt; });
  var top4 = entries.slice(0, 4);
  var otherAmt = entries.slice(4).reduce(function(s, e) { return s + e.amt; }, 0);
  if (otherAmt > 0) top4.push({ cat: 'Other', amt: otherAmt });

  // Build SVG arcs
  var svgHtml = '<circle cx="44" cy="44" r="33" fill="none" stroke="rgba(44,34,24,0.08)" stroke-width="13"/>';
  var offset = 0;
  top4.forEach(function(e) {
    if (!total || !e.amt) return;
    var color = CAT_COLOR_DONUT[e.cat] || '#e4eabf';
    var dash  = (e.amt / total) * CIRC;
    var gap   = CIRC - dash;
    svgHtml += '<circle cx="44" cy="44" r="33" fill="none"'
      + ' stroke="' + color + '" stroke-width="13"'
      + ' stroke-dasharray="' + dash.toFixed(1) + ' ' + gap.toFixed(1) + '"'
      + ' stroke-dashoffset="' + (-offset).toFixed(1) + '"'
      + ' transform="rotate(-90 44 44)" stroke-linecap="butt"/>';
    offset += dash;
  });
  var cLabel = total >= 100000 ? Math.round(total / 1000) + 'k'
             : total >= 1000   ? (total / 1000).toFixed(1) + 'k'
             : total;
  svgHtml += '<text x="44" y="40" text-anchor="middle" font-size="9" fill="#9a8c78" font-family="DM Sans" font-weight="300">Mar</text>';
  svgHtml += '<text x="44" y="52" text-anchor="middle" font-size="11" fill="#2a2218" font-family="DM Serif Display">' + cLabel + '</text>';
  svg.innerHTML = svgHtml;

  // Build legend
  legend.innerHTML = top4.length
    ? top4.map(function(e) {
        var color = CAT_COLOR_DONUT[e.cat] || '#e4eabf';
        var pct   = total > 0 ? Math.round(e.amt / total * 100) : 0;
        return '<div class="legend-item">'
          + '<div class="legend-left"><div class="legend-dot" style="background:' + color + '"></div><div class="legend-name">' + e.cat + '</div></div>'
          + '<div class="legend-right"><span class="legend-val">' + inr(e.amt) + '</span><span class="legend-pct">' + pct + '%</span></div>'
          + '</div>';
      }).join('')
    : '<div style="font-size:12px;color:var(--ink3);font-weight:300;padding:8px 0;">No expenses yet</div>';
}


// ─── 7. RENDER: INSIGHTS ─────────────────
// Drives both the Insights tab AND the Home page sync

function renderInsights() {
  var ct    = catTotals();
  var total = S.exp.reduce(function(s, e) { return s + e.amt; }, 0);
  var saved = Math.max(0, INCOME - total);
  var savePct = INCOME > 0 ? Math.round(saved / INCOME * 100) : 0;

  var food      = ct['Food']      || 0;
  var transport = ct['Transport'] || 0;
  var shopping  = ct['Shopping']  || 0;
  var utilities = ct['Utilities'] || 0;

  // ── Scores ──
  var budgetScore    = Math.max(0, Math.min(100, Math.round(100 - (total / INCOME - 0.5) * 100)));
  var saveScore      = Math.min(100, Math.round(savePct * 2.5));
  var foodScore      = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (food - PEER.Food) / PEER.Food) * 150)));
  var transportScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (transport - PEER.Transport) / PEER.Transport) * 100)));
  var goalScore      = S.goals.length > 0
    ? Math.min(100, Math.round(
        S.goals.reduce(function(s,g){return s+Math.min(g.saved,g.target);},0) /
        S.goals.reduce(function(s,g){return s+g.target;},0) * 100))
    : 0;
  var overallScore = Math.round((budgetScore + saveScore + foodScore + transportScore + goalScore) / 5);

  var healthLabel = overallScore>=80?'Excellent':overallScore>=65?'Good':overallScore>=45?'Fair':'Needs work';
  var healthColor = overallScore>=80?'#80d0a0':overallScore>=65?'#c49a6c':overallScore>=45?'#f0c080':'#e08888';
  var healthDesc  = overallScore>=80 ? 'Managing money really well. Keep it up!'
                  : overallScore>=65 ? 'Doing well overall. A few tweaks to hit Excellent.'
                  : overallScore>=45 ? 'Some categories need attention. Focus on biggest overspends.'
                  : 'Several areas need work. Start with food and savings.';

  // ── Health ring ──
  var CIRC_RING = 163.4;
  var arc = Math.round((overallScore / 100) * CIRC_RING * 10) / 10;
  var gap = CIRC_RING - arc;
  var ring = document.getElementById('ins-ring');
  if (ring) {
    ring.innerHTML =
      '<svg viewBox="0 0 64 64">'
      + '<circle cx="32" cy="32" r="26" fill="none" stroke="rgba(250,247,242,0.08)" stroke-width="7"/>'
      + '<circle cx="32" cy="32" r="26" fill="none" stroke="' + healthColor + '" stroke-width="7"'
      + ' stroke-dasharray="' + arc + ' ' + gap + '" stroke-dashoffset="41" stroke-linecap="round"/>'
      + '</svg>'
      + '<div class="hh-ring-lbl"><div class="hh-score">' + overallScore + '</div><div class="hh-denom">/100</div></div>';
  }
  var t = document.getElementById('ins-health-title');
  var d = document.getElementById('ins-health-desc');
  if (t) t.textContent = 'Financial health: ' + healthLabel;
  if (d) d.textContent = healthDesc;

  var hg = document.getElementById('ins-health-grid');
  if (hg) hg.innerHTML = [
    [budgetScore,'Budgeting'], [saveScore,'Saving'], [25,'Investing'],
    [foodScore,'Food ctrl'],   [goalScore,'Goals'],  [transportScore,'Transport']
  ].map(function(x) {
    return '<div class="hh-box"><div class="hh-val">' + x[0] + '</div><div class="hh-lbl">' + x[1] + '</div></div>';
  }).join('');

  // ── Card builders ──
  function barCard(ico, icoCls, tag, tagCls, title, body, rows) {
    var maxVal = Math.max.apply(null, rows.map(function(r) { return r[1]; })) || 1;
    var bars = rows.map(function(r) {
      var w = Math.round(r[1] / maxVal * 100);
      return '<div class="bar-row">'
        + '<div class="bar-lbl">' + r[0] + '</div>'
        + '<div class="bar-track"><div class="bar-fill ' + r[3] + '" style="width:' + w + '%"></div></div>'
        + '<div class="bar-val" style="' + (r[2]||'') + '">' + r[4] + '</div>'
        + '</div>';
    }).join('');
    return '<div class="ic"><div class="ic-head"><div class="ic-ico ' + icoCls + '">' + ico + '</div>'
      + '<div class="ic-meta"><div class="ic-tag ' + tagCls + '">' + tag + '</div>'
      + '<div class="ic-title">' + title + '</div></div></div>'
      + '<div class="ic-body">' + body + '</div><div class="bars">' + bars + '</div></div>';
  }

  function iboxCard(ico, icoCls, tag, tagCls, title, body, rows) {
    var rowsHtml = rows.map(function(r) {
      return '<div class="ibox-row"><div class="ibox-lbl">' + r[0] + '</div>'
        + '<div class="ibox-val" style="' + (r[2]||'') + '">' + r[1] + '</div></div>';
    }).join('');
    return '<div class="ic"><div class="ic-head"><div class="ic-ico ' + icoCls + '">' + ico + '</div>'
      + '<div class="ic-meta"><div class="ic-tag ' + tagCls + '">' + tag + '</div>'
      + '<div class="ic-title">' + title + '</div></div></div>'
      + '<div class="ic-body">' + body + '</div><div class="ibox">' + rowsHtml + '</div></div>';
  }

  // ── ALERTS ──
  var foodOver  = food - PEER.Food;
  var transOver = transport - PEER.Transport;
  var shopOver  = shopping - PEER.Shopping;

  function alertCard(cat, you, peer, label, peerLabel) {
    var over    = you - peer;
    var over0   = over > 0;
    var pctOver = Math.round(you / peer * 100) - 100;
    var ico     = you===0 ? CAT_ICON[cat] : over0 ? '🚨' : '✅';
    var icoCls  = you===0 ? 'i-sky'       : over0 ? 'i-red' : 'i-green';
    var tag     = you===0 ? 'No data'     : over0 ? 'Overspending' : 'Under budget';
    var tagCls  = over0 ? 't-warn' : 't-win';
    var title   = you===0
      ? 'No ' + cat.toLowerCase() + ' expenses yet'
      : over0
        ? cat + ' spend ' + Math.abs(pctOver) + '% above peers'
        : cat + ' spend ' + Math.abs(pctOver) + '% below peers — great!';
    var body    = you===0
      ? 'Peer avg is ' + inr(peer) + '/mo. Add your first ' + cat.toLowerCase() + ' expense to start tracking.'
      : over0
        ? 'You spent <span class="r">' + inr(you) + '</span> on ' + cat.toLowerCase() + '. Peers spend ' + inr(peer) + '. That\'s <span class="r">' + inr(Math.abs(over)) + ' extra</span>.'
        : 'You spent <span class="g">' + inr(you) + '</span> on ' + cat.toLowerCase() + '. <span class="g">' + inr(Math.abs(over)) + ' below</span> peer avg of ' + inr(peer) + '.';
    return barCard(ico, icoCls, tag, tagCls, title, body, [
      [label,     you,  over0?'color:#c04030':'color:#2a7a48', over0?'br':'bgr', inr(you)],
      [peerLabel, peer, '',                                     'bt',             inr(peer)]
    ]);
  }

  document.getElementById('ins-alerts').innerHTML =
    alertCard('Food',      food,      PEER.Food,      'You', 'Peer avg') +
    alertCard('Transport', transport, PEER.Transport, 'You', 'City avg') +
    alertCard('Shopping',  shopping,  PEER.Shopping,  'You', 'Peer avg');

  // ── BENCHMARKS ──
  document.getElementById('ins-bench').innerHTML =
    barCard('📊','i-sky','Benchmark','t-bench',
      'Your spend vs Mumbai peers (24-28, ₹50-60k)',
      'How your top categories compare to peers your age and income bracket.',
      [
        ['Food',      food,      food>PEER.Food?'color:#c04030':'color:#2a7a48',           food>PEER.Food?'br':'bgr',           inr(food)],
        ['Food avg',  PEER.Food, '',                                                        'bt',                                inr(PEER.Food)],
        ['Transport', transport, transport>PEER.Transport?'color:#c04030':'color:#2a7a48', transport>PEER.Transport?'br':'bgr', inr(transport)],
        ['Trans avg', PEER.Transport,'',                                                    'bt',                                inr(PEER.Transport)]
      ]
    ) +
    barCard('📉','i-red','Savings rate','t-bench',
      'Your savings rate vs peer group',
      'You\'re saving <span class="' + (savePct>=18?'g':'r') + '">' + savePct + '%</span> of income. Peers save 18% on average.',
      [
        ['You',     savePct, savePct>=18?'color:#2a7a48':'color:#c04030', savePct>=18?'bgr':'br', savePct+'%'],
        ['Peer avg',18,      '',                                            'bt',                  '18%'],
        ['Top 10%', 28,      'color:#2a7a48',                              'bgr',                 '28%+']
      ]
    );

  // ── HABITS ──
  var weekendTotal=0, weekdayTotal=0, weekendDays=0, weekdayDays=0, dayMap={};
  S.exp.forEach(function(e) {
    var day = new Date(e.date + 'T00:00:00').getDay();
    var isWknd = day===6 || day===0;
    if (isWknd) { weekendTotal+=e.amt; if(!dayMap['w'+e.date]){dayMap['w'+e.date]=1;weekendDays++;} }
    else         { weekdayTotal+=e.amt; if(!dayMap['d'+e.date]){dayMap['d'+e.date]=1;weekdayDays++;} }
  });
  var weekdayAvg  = weekdayDays>0 ? Math.round(weekdayTotal/weekdayDays) : 0;
  var weekendAvg  = weekendDays>0 ? Math.round(weekendTotal/weekendDays) : 0;
  var wkMultiple  = weekdayAvg>0  ? (weekendAvg/weekdayAvg).toFixed(1)  : '—';

  var dayTotals = {};
  S.exp.forEach(function(e) { dayTotals[e.date]=(dayTotals[e.date]||0)+e.amt; });
  var topDay = Object.keys(dayTotals).sort(function(a,b){return dayTotals[b]-dayTotals[a];})[0];

  var catCount = {};
  S.exp.forEach(function(e) { catCount[e.cat]=(catCount[e.cat]||0)+1; });
  var topCat = Object.keys(catCount).sort(function(a,b){return catCount[b]-catCount[a];})[0];

  var habits = '';
  if (weekendDays>0 && weekdayDays>0) {
    var wkOver = weekendAvg > weekdayAvg*1.3;
    habits += iboxCard(
      wkOver?'📅':'🗓️', wkOver?'i-amber':'i-green',
      wkOver?'Habit detected':'Good balance', wkOver?'t-habit2':'t-win',
      wkOver ? 'Weekend spending '+wkMultiple+'× your weekday average'
              : 'Weekend spending is well balanced',
      wkOver ? 'You spend <span class="a">'+wkMultiple+'× more</span> on weekends than weekdays.'
              : 'Weekend and weekday spending is <span class="g">well balanced</span> at '+wkMultiple+'×.',
      [['Weekday avg/day', inr(weekdayAvg),''], ['Weekend avg/day', inr(weekendAvg), wkOver?'color:#c04030':'color:#2a7a48']]
    );
  }
  if (topDay) {
    habits += iboxCard('🔥','i-red','Peak spend day','t-habit2',
      'Biggest single-day spend: ' + dayLbl(topDay),
      'You spent <span class="r">'+inr(dayTotals[topDay])+'</span> on '+dayLbl(topDay)+' — '+Math.round(dayTotals[topDay]/Math.max(1,total)*100)+'% of total spend.',
      [['Date',dayLbl(topDay),''],['Amount',inr(dayTotals[topDay]),'color:#c04030'],['% of total',Math.round(dayTotals[topDay]/Math.max(1,total)*100)+'%','']]
    );
  }
  if (topCat) {
    habits += iboxCard('🔁','i-sky','Most frequent category','t-bench',
      topCat+' is your most frequent spend',
      'You\'ve made <span class="p">'+catCount[topCat]+' '+topCat+' transactions</span>, totalling <span class="p">'+inr(ct[topCat]||0)+'</span>.',
      [['Category',topCat,''],['Transactions',catCount[topCat]+' times',''],['Total',inr(ct[topCat]||0),'color:#5a3a90']]
    );
  }
  if (!total) habits = '<div style="padding:20px;text-align:center;color:var(--ink3);font-size:13px;font-weight:300;">Add expenses to detect habits.</div>';
  document.getElementById('ins-habits').innerHTML = habits;

  // ── OPPORTUNITY ──
  var foodLeak  = Math.max(0, food - PEER.Food);
  var shopLeak  = Math.max(0, shopping - PEER.Shopping);
  var totalLeak = foodLeak + shopLeak;
  var sipAmt    = Math.max(500, Math.round((totalLeak/2)/500)*500);

  var opp = iboxCard('💸','i-blush','Opportunity cost','t-opp2',
    fmt_lakhs(sipFuture(totalLeak,10))+' in 10 yrs if overspend was invested',
    'Your food & shopping overspend vs peers — if invested at 12% Nifty 50:',
    [['Monthly leak',inr(totalLeak),'color:#c04030'],['5 years',inr(sipFuture(totalLeak,5)),'color:#2a7a48'],['10 years',inr(sipFuture(totalLeak,10)),'color:#2a7a48'],['20 years',inr(sipFuture(totalLeak,20)),'color:#2a7a48']]
  );
  opp += iboxCard('🌱','i-green','SIP opportunity','t-opp2',
    inr(sipAmt)+'/mo SIP = '+fmt_lakhs(sipFuture(sipAmt,20))+' in 20 years',
    'Redirect part of your overspend into a Nifty 50 index fund every month.',
    [['Suggested SIP',inr(sipAmt)+'/mo',''],['10 years',inr(sipFuture(sipAmt,10)),'color:#2a7a48'],['20 years',inr(sipFuture(sipAmt,20)),'color:#2a7a48']]
  );
  if (food > PEER.Food) {
    var cutHalf = Math.round(foodLeak/2);
    opp += iboxCard('✂️','i-amber','Quick win: cut food delivery','t-warn',
      'Cut food by 50% → save '+inr(cutHalf)+'/mo',
      'Halving food overspend gives <span class="g">'+inr(cutHalf)+'/mo</span> to invest.',
      [['Potential saving',inr(cutHalf)+'/mo','color:#2a7a48'],['In 10 years',inr(sipFuture(cutHalf,10)),'color:#2a7a48']]
    );
  }
  if (!total) opp = '<div style="padding:20px;text-align:center;color:var(--ink3);font-size:13px;font-weight:300;">Add expenses to see opportunities.</div>';
  document.getElementById('ins-opp').innerHTML = opp;

  // ── PROJECTIONS ──
  var proj = iboxCard('🔭','i-sky','20-year projection','t-bench',
    'What your current savings rate becomes',
    'Based on actual savings of <span class="g">'+inr(saved)+'/mo</span> at 12% index return:',
    [['Saving/mo',inr(saved),'color:#2a7a48'],['10 years',inr(sipFuture(saved,10)),'color:#2a7a48'],['20 years',inr(sipFuture(saved,20)),'color:#2a7a48'],['If leaks fixed',fmt_lakhs(sipFuture(saved+totalLeak,20)),'color:#80b060']]
  );
  var nearest = S.goals.filter(function(g){return g.saved<g.target;})
    .sort(function(a,b){return (a.date||'9999').localeCompare(b.date||'9999');})[0];
  if (nearest) {
    var toGo = nearest.target - nearest.saved;
    var mos  = saved>0 ? Math.ceil(toGo/saved) : '?';
    proj += iboxCard('🎯','i-amber','Nearest goal projection','t-bench',
      nearest.name+' — '+Math.round(nearest.saved/nearest.target*100)+'% done',
      'At '+inr(saved)+'/mo savings rate:',
      [['Target',inr(nearest.target),''],['Saved',inr(nearest.saved),'color:#2a7a48'],['Needed',inr(toGo),'color:#c04030'],['Months',mos+' months','']]
    );
  }
  proj += iboxCard('🏠','i-amber','Mumbai down payment','t-bench',
    '₹8L down payment at current savings',
    'At '+inr(saved)+'/mo savings:',
    [['Target','₹8,00,000',''],['Months needed',saved>0?Math.ceil(800000/saved)+' months':'—',''],['Reach by',saved>0?new Date(Date.now()+Math.ceil(800000/saved)*30*24*3600*1000).toLocaleDateString('en-IN',{month:'short',year:'numeric'}):'Save more','color:#2a7a48']]
  );
  document.getElementById('ins-proj').innerHTML = proj;

  // ── INVEST TAB: hero numbers ──
  var invAmt = document.getElementById('inv-hero-amt');
  var invSub = document.getElementById('inv-hero-sub');
  var inv10  = document.getElementById('inv-hero-10yr');
  var invCur = document.getElementById('inv-hero-cur');
  if (invAmt) invAmt.textContent = inr(totalLeak);
  if (invSub) invSub.textContent = totalLeak>0 ? 'is sitting on the table, uninvested' : 'within peer spending — great!';
  if (inv10)  inv10.textContent  = fmt_lakhs(sipFuture(totalLeak, 10));
  if (invCur) invCur.textContent = inr(ct['Finance'] || 0);

  // ── HOME PAGE SYNC ──
  // Insight cards
  var foodOver2   = food - PEER.Food;
  var foodIcoH    = food===0?'🍔':foodOver2>0?'🚨':'✅';
  var foodBgH     = food===0?'ii-wheat':foodOver2>0?'ii-red':'ii-sage';
  var foodTagH    = food===0?'t-habit':foodOver2>0?'t-over':'t-ok';
  var foodTagTxtH = food===0?'No food yet':foodOver2>0?'Overspending':'Under budget';
  var foodDescH   = food===0
    ? 'No food expenses logged. Peer avg is '+inr(PEER.Food)+'/mo.'
    : foodOver2>0
      ? inr(food)+' on food — '+inr(Math.abs(foodOver2))+' more than peers. Cutting delivery saves ~'+inr(Math.round(Math.abs(foodOver2)*12))+'/year.'
      : 'Spending '+inr(food)+' on food — '+inr(Math.abs(foodOver2))+' below peer avg of '+inr(PEER.Food)+'.';

  var transOver2  = transport - PEER.Transport;
  var transDescH  = transport===0 ? 'City avg is '+inr(PEER.Transport)+'/mo. Add transport to start tracking.'
    : transOver2>0 ? inr(transport)+' on transport — '+inr(Math.abs(transOver2))+' above city avg.'
    : 'Transport at '+inr(transport)+' — right at city average.';

  var homeHTML = ''
    + '<div class="insight-card"><div class="insight-ico '+foodBgH+'">'+foodIcoH+'</div><div>'
    + '<div class="insight-title">'+(food===0?'Start tracking food':'Food vs peer benchmark')+'</div>'
    + '<div class="insight-desc">'+foodDescH+'</div>'
    + '<div class="insight-tag '+foodTagH+'">'+foodTagTxtH+'</div></div></div>'

    + '<div class="insight-card"><div class="insight-ico '+(transOver2>0?'ii-red':transport===0?'ii-wheat':'ii-sage')+'">'+(transport===0?'🚗':transOver2>0?'⚠️':'✅')+'</div><div>'
    + '<div class="insight-title">Transport spend</div>'
    + '<div class="insight-desc">'+transDescH+'</div>'
    + '<div class="insight-tag '+(transOver2>0?'t-over':transport===0?'t-habit':'t-ok')+'">'+(transport===0?'No data':transOver2>0?'Overspending':'On track')+'</div></div></div>';

  if (weekendDays>0 && weekdayDays>0) {
    var wkOver2 = weekendAvg > weekdayAvg*1.3;
    homeHTML += '<div class="insight-card"><div class="insight-ico '+(wkOver2?'ii-wheat':'ii-sage')+'">'+(wkOver2?'📅':'🗓️')+'</div><div>'
      + '<div class="insight-title">Weekend spending pattern</div>'
      + '<div class="insight-desc">'+(wkOver2?'Weekend avg ('+inr(weekendAvg)+'/day) is '+wkMultiple+'× your weekday avg.':'Weekend balanced at '+wkMultiple+'× weekday avg. Good discipline.')+'</div>'
      + '<div class="insight-tag '+(wkOver2?'t-habit':'t-ok')+'">'+(wkOver2?'Habit detected':'Balanced')+'</div></div></div>';
  }

  homeHTML += totalLeak>0
    ? '<div class="insight-card"><div class="insight-ico ii-sky">💸</div><div>'
      + '<div class="insight-title">Opportunity cost</div>'
      + '<div class="insight-desc">'+inr(totalLeak)+'/mo overspend → '+fmt_lakhs(sipFuture(totalLeak,10))+' in 10 years at 12%.</div>'
      + '<div class="insight-tag t-opp">Opportunity cost</div></div></div>'
    : '<div class="insight-card"><div class="insight-ico ii-sage">🌱</div><div>'
      + '<div class="insight-title">Within peer spending</div>'
      + '<div class="insight-desc">Spending within benchmarks. A '+inr(sipAmt)+'/mo SIP grows to '+fmt_lakhs(sipFuture(sipAmt,10))+' in 10 years.</div>'
      + '<div class="insight-tag t-ok">On track</div></div></div>';

  var hi = document.getElementById('home-insights');
  if (hi) hi.innerHTML = homeHTML;

  // Future self
  var futureCur = document.getElementById('home-future-cur');
  var futureOpt = document.getElementById('home-future-opt');
  if (futureCur) futureCur.textContent = fmt_lakhs(sipFuture(saved, 20));
  if (futureOpt) futureOpt.textContent = fmt_lakhs(sipFuture(saved + totalLeak, 20));

  // Personality
  var persData = [
    {micro:'Food control',   val:foodScore>=70?'Excellent':foodScore>=45?'Moderate':'High risk',           pct:100-foodScore,     cls:'p1'},
    {micro:'Savings habit',  val:saveScore>=70?'Excellent':saveScore>=40?'Good':'Needs work',              pct:saveScore,          cls:'p2'},
    {micro:'Transport',      val:transportScore>=80?'Excellent':transportScore>=50?'Good':'Watch out',     pct:transportScore,    cls:'p3'},
    {micro:'Overall budget', val:budgetScore>=70?'Excellent':budgetScore>=45?'Fair':'Watch out',           pct:budgetScore,       cls:'p4'}
  ];
  var pg = document.getElementById('home-personality');
  if (pg) pg.innerHTML = persData.map(function(p) {
    return '<div class="pers-card '+p.cls+'"><div class="pers-micro">'+p.micro+'</div><div class="pers-val">'+p.val+'</div><div class="pers-track"><div class="pers-fill" style="width:'+p.pct+'%"></div></div></div>';
  }).join('');

  // Report card
  var grade     = overallScore>=90?'A+':overallScore>=80?'A':overallScore>=70?'B+':overallScore>=60?'B':overallScore>=50?'C+':'C';
  var gradeHint = overallScore>=80 ? 'Excellent financial health this month!'
                : overallScore>=65 ? 'Good progress. Fix food & subs to push higher.'
                : overallScore>=50 ? 'Room to improve. Focus on biggest overspend.'
                : 'Several areas need attention. Start with savings and food.';
  var gEl=document.getElementById('home-grade');
  var gtEl=document.getElementById('home-grade-title');
  var ghEl=document.getElementById('home-grade-hint');
  if (gEl)  gEl.textContent  = grade;
  if (gtEl) gtEl.textContent = overallScore>=70 ? 'Good progress, Riya!' : "Let's work on this, Riya.";
  if (ghEl) ghEl.textContent = gradeHint;

  var metricsEl = document.getElementById('home-report-metrics');
  if (metricsEl) metricsEl.innerHTML = [
    ['Budgeting',   budgetScore,    'rf-tan'],
    ['Saving rate', saveScore,      'rf-sky'],
    ['Investments', 25,             'rf-sage'],
    ['Food control',foodScore,      'rf-blush'],
    ['Goal progress',goalScore,     'rf-wheat']
  ].map(function(m) {
    return '<div class="report-row"><div class="report-lbl">'+m[0]+'</div>'
      + '<div class="report-track"><div class="report-fill '+m[2]+'" style="width:'+m[1]+'%"></div></div>'
      + '<div class="report-score">'+m[1]+'</div></div>';
  }).join('');
}


// ─── 8. RENDER: EXPENSES ─────────────────

function renderExp() {
  var ct    = catTotals();
  var total = S.exp.reduce(function(s,e){return s+e.amt;},0);
  var saved = Math.max(0, INCOME - total);
  var savePct = INCOME>0 ? Math.round(saved/INCOME*100) : 0;

  // Expenses tab
  document.getElementById('exp-total').textContent = inr(total);
  document.getElementById('exp-count').textContent = S.exp.length + ' txns';

  // Home hero
  document.getElementById('hero-total').textContent = inr(total);
  document.getElementById('hero-sub').textContent   = 'Monthly income ' + inr(INCOME) + ' · saved ' + inr(saved);
  document.getElementById('hero-pill-food').textContent = (total>0 ? Math.round((ct['Food']||0)/total*100) : 0) + '% food';
  document.getElementById('hero-pill-save').textContent = savePct + '% savings';

  // Donut
  renderDonut(ct, total);

  // Transaction list
  var grps = {};
  S.exp.slice().sort(function(a,b){
    return b.date.localeCompare(a.date) || (b.time||'').localeCompare(a.time||'');
  }).forEach(function(e) { (grps[e.date] = grps[e.date]||[]).push(e); });

  var html = '';
  if (!S.exp.length) {
    html = '<div style="padding:52px 20px;text-align:center;color:var(--ink3);font-size:13px;font-weight:300;line-height:1.8;">No expenses yet.<br><strong style="color:var(--tan);">Tap ＋ Add</strong> to get started.</div>';
  } else {
    Object.keys(grps).sort(function(a,b){return b.localeCompare(a);}).forEach(function(date) {
      html += '<div class="txn-group"><div class="txn-day">' + dayLbl(date) + '</div><div class="txn-list">';
      grps[date].forEach(function(e,i) {
        var last = i === grps[date].length-1;
        html += '<div class="txn-row"' + (last?' style="border-bottom:none"':'') + ' onclick="openEditExp(\'' + e.id + '\')">'
          + '<div class="txn-ico" style="background:' + (CAT_BG[e.cat]||'#f0f0e8') + '">' + (e.icon||CAT_ICON[e.cat]||'💸') + '</div>'
          + '<div class="txn-mid"><div class="txn-name">' + e.desc + '</div>'
          + '<div class="txn-meta">' + (e.time?e.time+' · ':'') + e.cat + (e.subcat?' › '+e.subcat:'') + '</div></div>'
          + '<div class="txn-right"><div class="txn-amt">−' + inr(e.amt) + '</div><div class="txn-cat">' + e.cat + '</div></div>'
          + '</div>';
      });
      html += '</div></div>';
    });
  }
  document.getElementById('exp-list').innerHTML = html;

  renderCards();
  renderInsights();
}


// ─── 9. RENDER: CATEGORY CARDS ───────────

function renderCards() {
  var cats = ['Living','Food','Transport','Shopping','Utilities','Lifestyle','Health','Finance'];
  var ct   = {}, sc = {};
  S.exp.forEach(function(e) {
    ct[e.cat] = (ct[e.cat]||0) + e.amt;
    if (e.subcat) {
      if (!sc[e.cat]) sc[e.cat] = {};
      sc[e.cat][e.subcat] = (sc[e.cat][e.subcat]||0) + e.amt;
    }
  });

  var html = '';
  cats.forEach(function(cat,i) {
    if (i >= 4 && !extraOn) return;
    var t    = ct[cat] || 0;
    var pct  = INCOME>0 ? Math.round(t/INCOME*100) : 0;
    var subs = CAT_SUBS[cat] || [];
    var numSubs = Object.keys(sc[cat]||{}).length;
    var badge   = t>0 ? (numSubs>0 ? numSubs+' subcats' : 'tracked') : '₹0';
    var subHtml = subs.map(function(s) {
      var v = (sc[cat]&&sc[cat][s[0]]) || 0;
      return '<div class="fb-row"><div class="fb-left"><div class="fb-dot" style="background:'+s[1]+'"></div><span class="fb-name">'+s[0]+'</span></div><span class="fb-val">'+inr(v)+'</span></div>';
    }).join('');

    html += '<div class="flip-card" onclick="flipIt(this)">'
      +   '<div class="flip-inner">'
      +     '<div class="flip-front ' + (CAT_CLS[cat]||'cat-living') + '">'
      +       '<div class="fc-top"><span class="fc-emoji">'+CAT_ICON[cat]+'</span><span class="fc-badge">'+badge+'</span></div>'
      +       '<div><div class="fc-lbl">'+cat+'</div><div class="fc-amt">'+inr(t)+'</div><div class="fc-sub">'+pct+'% of income</div></div>'
      +     '</div>'
      +     '<div class="flip-back">'
      +       '<div class="fb-head"><span style="font-size:14px;">'+CAT_ICON[cat]+'</span><span style="font-size:12px;font-weight:500;color:var(--ink);">'+cat+'</span><span style="margin-left:auto;color:var(--ink4);font-size:16px;">×</span></div>'
      +       '<div class="fb-list">'+subHtml+'</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  });
  document.getElementById('cat-grid').innerHTML = html;
}

function flipIt(card) {
  var was = card.classList.contains('flipped');
  document.querySelectorAll('#cat-grid .flipped').forEach(function(c){c.classList.remove('flipped');});
  if (!was) card.classList.add('flipped');
}

function toggleExtra() {
  extraOn = !extraOn;
  document.getElementById('spend-toggle').textContent = extraOn ? 'See less' : 'See all';
  renderCards();
}


// ─── 10. RENDER: GOALS ───────────────────

function renderGoals() {
  var active = S.goals.filter(function(g){return g.saved < g.target;});
  var done   = S.goals.filter(function(g){return g.saved >= g.target;});

  // Hero
  var totSaved  = S.goals.reduce(function(s,g){return s+Math.min(g.saved,g.target);},0);
  var totTarget = S.goals.reduce(function(s,g){return s+g.target;},0);
  var pct       = totTarget>0 ? Math.round(totSaved/totTarget*100) : 0;
  var nearest   = active.slice().sort(function(a,b){return (a.date||'9999').localeCompare(b.date||'9999');})[0];
  document.getElementById('gh-val').textContent     = inr(totSaved);
  document.getElementById('gh-of').textContent      = 'of ' + inr(totTarget);
  document.getElementById('gh-sub').textContent     = active.length + ' active goals · ' + pct + '% overall';
  document.getElementById('gh-saved').textContent   = inr(totSaved);
  document.getElementById('gh-active').textContent  = active.length;
  document.getElementById('gh-nearest').textContent = nearest && nearest.date
    ? new Date(nearest.date+'-01').toLocaleDateString('en-IN',{month:'short',year:'2-digit'}) : '—';

  // Active list
  var aHtml = !active.length
    ? '<div style="padding:20px 16px;text-align:center;color:var(--ink3);font-size:13px;font-weight:300;line-height:1.7;">No active goals.<br><strong style="color:var(--tan);">Tap ＋ Add goal</strong> to start.</div>'
    : active.map(function(g) {
        var p     = Math.min(100, Math.round(g.saved/g.target*100));
        var toGo  = g.target - g.saved;
        var tc    = p>=75?'tg-close':p>=40?'tg-ok':'tg-warn';
        var tt    = p>=75?'Almost there!':p>=40?'On track':'Needs more';
        var ds    = g.date ? new Date(g.date+'-01').toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '—';
        return '<div class="goal-full">'
          + '<div class="gc-top"><div class="gc-emoji">'+g.icon+'</div><div class="gc-info"><div class="gc-name">'+g.name+'</div><div class="gc-deadline">Target · '+inr(g.target)+' by '+ds+'</div></div><div class="gc-pct">'+p+'%</div></div>'
          + '<div class="gc-bar-wrap"><div class="gc-bar-track"><div class="gc-bar-fill" style="width:'+p+'%"></div></div>'
          + '<div class="gc-bar-labels"><div class="gc-saved">'+inr(g.saved)+' saved</div><div class="gc-to-go">'+inr(toGo)+' to go</div></div></div>'
          + '<div class="gc-divider"></div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
          + '<div class="gcm-tag '+tc+'">'+tt+'</div>'
          + '<div style="display:flex;gap:8px;">'
          + '<button onclick="openAddFunds(\''+g.id+'\')" style="background:var(--tan);color:var(--surface);border:none;border-radius:100px;padding:6px 14px;font-size:11px;font-weight:500;font-family:\'DM Sans\',sans-serif;cursor:pointer;">＋ Add funds</button>'
          + '<button onclick="openEditGoal(\''+g.id+'\')" style="background:var(--surface);border:0.5px solid var(--wheat);border-radius:100px;padding:6px 14px;font-size:11px;font-weight:500;font-family:\'DM Sans\',sans-serif;cursor:pointer;color:var(--ink2);">Edit</button>'
          + '</div></div></div>';
      }).join('');
  document.getElementById('goals-active').innerHTML = aHtml;

  // Completed
  var doneWrap = document.getElementById('goals-done-wrap');
  doneWrap.style.display = done.length ? '' : 'none';
  if (done.length) {
    document.getElementById('goals-done').innerHTML = done.map(function(g) {
      return '<div class="completed-card"><div class="cc-ico">'+g.icon+'</div><div class="cc-mid"><div class="cc-name">'+g.name+'</div><div class="cc-date">Completed · '+inr(g.target)+'</div></div><div class="cc-done">Done ✓</div></div>';
    }).join('');
  }

  // Home preview
  document.getElementById('home-goals').innerHTML = active.slice(0,3).map(function(g) {
    var p = Math.min(100, Math.round(g.saved/g.target*100));
    return '<div class="goal-sm"><div class="goal-sm-top"><div class="goal-sm-left"><div class="goal-sm-ico">'+g.icon+'</div><div><div class="goal-sm-name">'+g.name+'</div><div class="goal-sm-sub">'+inr(g.saved)+' of '+inr(g.target)+'</div></div></div><div class="goal-sm-pct">'+p+'%</div></div><div class="goal-track"><div class="goal-fill" style="width:'+p+'%"></div></div></div>';
  }).join('') || '<div style="padding:12px 0;color:var(--ink3);font-size:12px;font-weight:300;">No active goals yet.</div>';
}


// ─── 11. CRUD: EXPENSES ──────────────────

function renderSubcats(cat, selSub) {
  var subs = CAT_SUBS[cat] || [];
  var wrap = document.getElementById('subcat-wrap');
  var cont = document.getElementById('exp-subcats');
  if (!subs.length) { wrap.style.display='none'; return; }
  wrap.style.display = '';
  cont.innerHTML = subs.map(function(s,i) {
    var sel = selSub ? s[0]===selSub : i===0;
    return '<button class="cat-chip'+(sel?' sel':'')+'" style="border-left:3px solid '+s[1]+'" onclick="pickSubcat(this)">'+s[0]+'</button>';
  }).join('');
}

function openAddExp() {
  eId = null;
  document.getElementById('exp-modal-ttl').textContent = 'Add expense';
  document.getElementById('f-amt').value  = '';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('f-time').value = new Date().toTimeString().slice(0,5);
  document.querySelectorAll('#exp-cats .cat-chip').forEach(function(c,i){c.classList.toggle('sel',i===0);});
  renderSubcats('Food', null);
  document.getElementById('exp-del').style.display = 'none';
  document.getElementById('exp-modal').classList.add('open');
}

function openEditExp(id) {
  var e = S.exp.find(function(x){return x.id===id;}); if (!e) return;
  eId = id;
  document.getElementById('exp-modal-ttl').textContent = 'Edit expense';
  document.getElementById('f-amt').value  = e.amt;
  document.getElementById('f-desc').value = e.desc;
  document.getElementById('f-date').value = e.date;
  document.getElementById('f-time').value = e.time || '';
  document.querySelectorAll('#exp-cats .cat-chip').forEach(function(c){c.classList.toggle('sel',c.textContent===e.cat);});
  renderSubcats(e.cat, e.subcat||null);
  document.getElementById('exp-del').style.display = '';
  document.getElementById('exp-modal').classList.add('open');
}

function closeExpModal() { document.getElementById('exp-modal').classList.remove('open'); eId=null; }

function saveExp() {
  var amt  = parseFloat(document.getElementById('f-amt').value);
  var desc = document.getElementById('f-desc').value.trim();
  var date = document.getElementById('f-date').value;
  var time = document.getElementById('f-time').value;
  var selCat = document.querySelector('#exp-cats .cat-chip.sel');
  var selSub = document.querySelector('#exp-subcats .cat-chip.sel');
  var cat    = selCat ? selCat.textContent : 'Other';
  var subcat = selSub ? selSub.textContent : '';
  if (!amt||amt<=0) { toast('Enter a valid amount'); return; }
  if (!desc)        { toast('Add a description');    return; }
  if (!date)        { toast('Pick a date');          return; }
  var icon = CAT_ICON[cat] || '💸';
  if (eId) {
    var i = S.exp.findIndex(function(x){return x.id===eId;});
    if (i>-1) S.exp[i] = {id:eId, desc:desc, amt:amt, cat:cat, subcat:subcat, date:date, time:time, icon:icon};
    toast('Expense updated ✓');
  } else {
    S.exp.unshift({id:uid(), desc:desc, amt:amt, cat:cat, subcat:subcat, date:date, time:time, icon:icon});
    toast('Expense added ✓');
  }
  saveState(); closeExpModal(); renderExp();
}

function delExp() {
  if (!eId) return;
  S.exp = S.exp.filter(function(e){return e.id!==eId;});
  saveState(); closeExpModal(); renderExp(); toast('Expense deleted');
}


// ─── 12. CRUD: GOALS ─────────────────────

function openAddGoal() {
  gId = null;
  document.getElementById('goal-modal-ttl').textContent = 'New goal';
  document.getElementById('g-name').value   = '';
  document.getElementById('g-target').value = '';
  document.getElementById('g-saved').value  = '';
  document.getElementById('g-date').value   = '';
  document.querySelectorAll('#goal-emojis .emoji-opt').forEach(function(e,i){e.classList.toggle('sel',i===0);});
  document.getElementById('goal-del').style.display = 'none';
  document.getElementById('goal-modal').classList.add('open');
}

function openEditGoal(id) {
  var g = S.goals.find(function(x){return x.id===id;}); if (!g) return;
  gId = id;
  document.getElementById('goal-modal-ttl').textContent = 'Edit goal';
  document.getElementById('g-name').value   = g.name;
  document.getElementById('g-target').value = g.target;
  document.getElementById('g-saved').value  = g.saved;
  document.getElementById('g-date').value   = g.date || '';
  document.querySelectorAll('#goal-emojis .emoji-opt').forEach(function(e){e.classList.toggle('sel',e.textContent.trim()===g.icon);});
  document.getElementById('goal-del').style.display = '';
  document.getElementById('goal-modal').classList.add('open');
}

function closeGoalModal() { document.getElementById('goal-modal').classList.remove('open'); gId=null; }

function saveGoal() {
  var name   = document.getElementById('g-name').value.trim();
  var target = parseFloat(document.getElementById('g-target').value);
  var saved  = parseFloat(document.getElementById('g-saved').value) || 0;
  var date   = document.getElementById('g-date').value;
  var sel    = document.querySelector('#goal-emojis .emoji-opt.sel');
  var icon   = sel ? sel.textContent.trim() : '🎯';
  if (!name)           { toast('Give your goal a name');    return; }
  if (!target||target<=0) { toast('Enter a target amount');return; }
  if (gId) {
    var i = S.goals.findIndex(function(x){return x.id===gId;});
    if (i>-1) S.goals[i] = {id:gId, name:name, target:target, saved:saved, date:date, icon:icon};
    toast('Goal updated ✓');
  } else {
    S.goals.push({id:uid(), name:name, target:target, saved:saved, date:date, icon:icon});
    toast('Goal created ✓');
  }
  saveState(); closeGoalModal(); renderGoals();
}

function delGoal() {
  if (!gId) return;
  if (!confirm('Delete this goal?')) return;
  S.goals = S.goals.filter(function(g){return g.id!==gId;});
  saveState(); closeGoalModal(); renderGoals(); toast('Goal deleted');
}


// ─── 13. UI HELPERS ──────────────────────

function showSec(i, btn) {
  for (var j=0;j<5;j++) document.getElementById('isec'+j).classList.toggle('on',j===i);
  btn.closest('.sub-tabs').querySelectorAll('.stab').forEach(function(s,j){s.classList.toggle('on',j===i);});
  renderInsights();
  window.scrollTo({top:0});
}

function pickCat(el) {
  el.closest('.cat-chips').querySelectorAll('.cat-chip').forEach(function(c){c.classList.remove('sel');});
  el.classList.add('sel');
  renderSubcats(el.textContent, null);
}

function pickSubcat(el) {
  el.closest('.cat-chips').querySelectorAll('.cat-chip').forEach(function(c){c.classList.remove('sel');});
  el.classList.add('sel');
}

function pickEmoji(el) {
  el.parentElement.querySelectorAll('.emoji-opt').forEach(function(e){e.classList.remove('sel');});
  el.classList.add('sel');
}

document.getElementById('exp-modal').addEventListener('click', function(e)  { if(e.target===this) closeExpModal();  });
document.getElementById('goal-modal').addEventListener('click', function(e) { if(e.target===this) closeGoalModal(); });


// ─── ADD FUNDS ───────────────────────────

var fundsGoalId = null;

function openAddFunds(id) {
  var g = S.goals.find(function(x){return x.id===id;}); if(!g) return;
  fundsGoalId = id;
  var pct = Math.min(100, Math.round(g.saved/g.target*100));
  document.getElementById('funds-modal-ttl').textContent    = g.icon + ' ' + g.name;
  document.getElementById('funds-saved-display').textContent = inr(g.saved);
  document.getElementById('funds-target-display').textContent= inr(g.target);
  document.getElementById('funds-progress-bar').style.width  = pct + '%';
  document.getElementById('funds-amt').value = '';
  document.getElementById('funds-preview').style.display = 'none';
  document.getElementById('funds-modal').classList.add('open');
  setTimeout(function(){ document.getElementById('funds-amt').focus(); }, 300);
}

function previewFunds() {
  var g = S.goals.find(function(x){return x.id===fundsGoalId;}); if(!g) return;
  var amt = parseFloat(document.getElementById('funds-amt').value) || 0;
  if (amt <= 0) { document.getElementById('funds-preview').style.display='none'; return; }
  var newSaved  = Math.min(g.target, g.saved + amt);
  var stillNeed = Math.max(0, g.target - newSaved);
  var newPct    = Math.min(100, Math.round(newSaved/g.target*100));
  document.getElementById('funds-new-total').textContent   = inr(newSaved);
  document.getElementById('funds-still-needed').textContent = inr(stillNeed);
  document.getElementById('funds-still-needed').style.color = stillNeed===0 ? '#2a7a48' : 'var(--ink)';
  document.getElementById('funds-new-pct').textContent     = newPct + '%';
  document.getElementById('funds-progress-bar').style.width = newPct + '%';
  document.getElementById('funds-preview').style.display   = '';
}

function saveFunds() {
  var g = S.goals.find(function(x){return x.id===fundsGoalId;}); if(!g) return;
  var amt = parseFloat(document.getElementById('funds-amt').value);
  if (!amt||amt<=0) { toast('Enter an amount'); return; }
  g.saved = Math.min(g.target, g.saved + amt);
  saveState();
  document.getElementById('funds-modal').classList.remove('open');
  fundsGoalId = null;
  renderGoals();
  if (g.saved >= g.target) {
    setTimeout(function(){ toast('🎉 Goal completed!'); }, 300);
  } else {
    toast('₹' + amt.toLocaleString('en-IN') + ' added ✓');
  }
}

document.getElementById('funds-modal').addEventListener('click', function(e){
  if(e.target===this){ this.classList.remove('open'); fundsGoalId=null; }
});

// Migrate old data missing subcat field
if (S.exp.some(function(e){return e.subcat===undefined;})) {
  S.exp = defExp(); saveState();
}

// Init home nav dot
var homeNav = document.getElementById('nav-home');
if (homeNav && !homeNav.querySelector('.ni-dot')) {
  var initDot = document.createElement('div');
  initDot.className = 'ni-dot';
  homeNav.appendChild(initDot);
}

renderExp();
renderGoals();

