/* ===== Tiện ích ===== */
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P = s => { const [a, b, c] = s.split('-'); return new Date(a, b - 1, c); };
const F = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const T0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);

/* ===== Dữ liệu (lưu trong trình duyệt) ===== */
const DEF = {
  a: 'Anh', b: 'Em', start: '2026-09-05', pa: '', pb: '', bg: '', pass: 'yeuem', theme: 'auto',
  morning: { t: '', d: '' }, gal: [], sos: [], events: [], info: {},
  shopping: [], dishes: [], shopHistory: [], receipts: [],
  notes: [
    'Cảm ơn vì đã ở bên mình mỗi ngày 💗',
    'Hôm nay nhớ uống đủ nước, và nhớ là mình thương nhau nhé!',
    'Có cậu, ngày thường cũng thành ngày lễ.',
    'Mệt thì cứ dựa vào mình, mình ở đây.',
    'Nụ cười của cậu là điều đẹp nhất mình thấy hôm nay.',
    'Chúc cậu một ngày thật nhẹ nhàng, tối mình gặp nhau nhé!',
    'Yêu cậu không cần lý do, nhưng mình có cả ngàn lý do để ở lại.'
  ],
  sweet: ['Mình xin lỗi, mình thương cậu nhiều lắm 💗', 'Giận cũng được, nhưng đừng buông tay mình nhé.'],
  reasons: ['Vì cậu luôn làm mình cười', 'Vì cậu kiên nhẫn với mình', 'Vì ở cạnh cậu, mình thấy bình yên']
};
let S;
try { S = { ...DEF, ...JSON.parse(localStorage.getItem('love') || '{}') }; } catch (e) { S = { ...DEF }; }
const save = () => { try { localStorage.setItem('love', JSON.stringify(S)); } catch (e) { alert('Bộ nhớ trình duyệt đã đầy. Hãy xóa bớt ảnh rồi thử lại nhé.'); } };

/* Thu nhỏ ảnh trước khi lưu */
function pick(file, max, cb, q = .85) {
  const r = new FileReader();
  r.onload = () => {
    const i = new Image();
    i.onload = () => {
      const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas');
      c.width = i.width * k; c.height = i.height * k;
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(i, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', q));
    };
    i.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ===== Các dịp lễ tình yêu ở Việt Nam ===== */
const TET = { 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26' };
const TT = { 2026: '2026-08-19', 2027: '2027-08-08', 2028: '2028-08-26' }; 
const FIX = [[2, 14, 'Valentine 💝', 'val'], [3, 8, 'Quốc tế Phụ nữ 🌷', 'flower'], [3, 14, 'Valentine Trắng 🤍', 'val'],
  [5, 20, '520 – ngày tỏ tình 💌', 'val'], [10, 20, 'Phụ nữ Việt Nam 🌹', 'flower'], [12, 24, 'Giáng sinh 🎄', 'noel']];
function holidays() {
  const y = new Date().getFullYear(), o = [];
  for (const Y of [y, y + 1]) {
    FIX.forEach(([m, d, n, t]) => o.push({ n, d: new Date(Y, m - 1, d), t }));
    if (TET[Y]) o.push({ n: 'Tết Nguyên Đán 🧧', d: P(TET[Y]), t: 'tet' });
    if (TT[Y]) o.push({ n: 'Thất Tịch 🌌', d: P(TT[Y]), t: 'val' });
  }
  return o;
}

/* ===== Giao diện theo mùa / dịp lễ ===== */
const TH = {
  spring: ['Xuân 🌸', ['🌸', '🌷', '💗'], '#ffe3ee', '#ffc2d9', '#ff6fa5'],
  summer: ['Hè ☀️', ['🦋', '🌻', '💛'], '#fff1d6', '#ffd1dc', '#ff8fa3'],
  autumn: ['Thu 🍂', ['🍂', '🍁', '🧡'], '#ffe8d6', '#ffc9b0', '#ff8a65'],
  winter: ['Đông ❄️', ['❄️', '✨', '💙'], '#e6f0ff', '#ffd9ec', '#ff7eb6'],
  val: ['Valentine 💝', ['❤️', '💖', '💘'], '#ffd6dc', '#ff9eb0', '#e8294f'],
  flower: ['Ngày hoa 🌹', ['🌹', '🌷', '💐'], '#ffe0ec', '#ffb8d0', '#e0457b'],
  tet: ['Tết 🧧', ['🌸', '🧧', '🏮'], '#fff0c9', '#ffb3b3', '#e53935'],
  noel: ['Noel 🎄', ['❄️', '🎄', '⭐'], '#e6f7ee', '#ffd6d6', '#d62f4a']
};
let EM = TH.spring[1];
function autoTheme() {
  const t = T0(); let best = null;
  holidays().forEach(h => {
    const l = Math.round((h.d - t) / 864e5);
    if (l >= 0 && l <= (h.t == 'tet' ? 7 : 3) && (!best || l < best.l)) best = { ...h, l };
  });
  if (best) return best;
  const m = t.getMonth() + 1;
  return { t: m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter' };
}
function theme() {
  const a = autoTheme(), k = S.theme && S.theme != 'auto' ? S.theme : a.t, t = TH[k] || TH.spring;
  const r = document.documentElement.style;
  r.setProperty('--g1', t[2]); r.setProperty('--g2', t[3]); r.setProperty('--ac', t[4]);
  EM = t[1];
  const st = P(S.start), n = T0(); let msg = '';
  if (a.l === 0) msg = `Hôm nay là ${a.n} 🎉`; else if (a.l) msg = `Còn ${a.l} ngày nữa là ${a.n}`;
  if (st.getMonth() == n.getMonth() && st.getDate() == n.getDate() && n > st) msg = `🎉 Kỷ niệm ${n.getFullYear() - st.getFullYear()} năm yêu nhau!`;
  $('#banner').hidden = !msg; $('#banner').textContent = msg;
}

/* ===== Màn hình chính ===== */
const MS = [100, 200, 300, 365, 500, 730, 1000, 1095, 1500, 2000, 3000];
let DAYS = 0;
function hero() {
  const st = P(S.start), n = T0();
  DAYS = Math.max(0, Math.round((n - st) / 864e5) + 1);
  $('#nA').textContent = S.a; $('#nB').textContent = S.b;
  let y = n.getFullYear() - st.getFullYear(), m = n.getMonth() - st.getMonth(), d = n.getDate() - st.getDate();
  if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  $('#detail').textContent = `${y} năm ${m} tháng ${d} ngày`;
  const nm = MS.find(x => x > DAYS);
  $('#next').textContent = nm ? `🎯 Còn ${nm - DAYS} ngày nữa tới mốc ${nm} ngày yêu` : '';
  $('#days').textContent = DAYS;
  $('#startPick').value = S.start;
}
function countUp() {
  const t0 = performance.now();
  (function f(t) {
    const k = Math.min(1, (t - t0) / 1500);
    $('#days').textContent = Math.round(DAYS * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
function tick() {
  const ms = Date.now() - P(S.start);
  $('#live').textContent = ms > 0 ? `Đã bên nhau ${Math.floor(ms / 36e5).toLocaleString('vi')} giờ ${Math.floor(ms / 6e4) % 60} phút ${Math.floor(ms / 1e3) % 60} giây` : '';
}
function ava() {
  [['A', 'pa'], ['B', 'pb']].forEach(([x, k]) => {
    const u = S[k] ? `url(${S[k]})` : '';
    $('#av' + x).style.backgroundImage = u;
    $('#av' + x).classList.toggle('has', !!S[k]);
  });
  const b = S.bg ? `url(${S.bg})` : ''; $('#bg').style.backgroundImage = b; $('#bgFull').style.backgroundImage = b;
}
$('#bgUp input').onchange = e => { const f = e.target.files[0]; if (f) pick(f, 1920, s => { S.bg = s; save(); ava(); }, .88); };
[['A', 'pa'], ['B', 'pb']].forEach(([x, k]) => {
  $('#av' + x + ' input').onchange = e => { const f = e.target.files[0]; if (f) pick(f, 600, s => { S[k] = s; save(); ava(); }, .9); };
});

/* ===== Đếm ngược sự kiện ===== */
function nextYearly(m, d) { const n = T0(); let x = new Date(n.getFullYear(), m, d); if (x < n) x.setFullYear(x.getFullYear() + 1); return x; }
function events() {
  const n = T0(), L = [];
  const add = (name, d, i) => { const l = Math.round((d - n) / 864e5); if (l >= 0) L.push({ name, l, i }); };
  holidays().forEach(h => add(h.n, h.d));
  const st = P(S.start);
  MS.forEach(m => { const d = new Date(st); d.setDate(d.getDate() + m - 1); add(`Mốc ${m} ngày yêu 💞`, d); });
  const an = nextYearly(st.getMonth(), st.getDate());
  add(`Kỷ niệm ${an.getFullYear() - st.getFullYear()} năm yêu nhau 💍`, an);
  [['bdA', S.a], ['bdB', S.b]].forEach(([k, name]) => {
    if (S.info[k]) { const b = P(S.info[k]); add(`🎂 Sinh nhật ${name}`, nextYearly(b.getMonth(), b.getDate())); }
  });
  S.events.forEach((e, i) => add(`📍 ${e.n}`, P(e.d), i));
  L.sort((a, b) => a.l - b.l);
  $('#evList').innerHTML = L.slice(0, 10).map(e =>
    `<li><span>${esc(e.name)}</span><span><b>${e.l === 0 ? 'Hôm nay!' : e.l + ' ngày'}</b> ${e.i != null ? `<button data-del="${e.i}" aria-label="Xóa">✕</button>` : ''}</span></li>`).join('');
}
$('#evList').onclick = e => { const i = e.target.dataset.del; if (i != null) { S.events.splice(i, 1); save(); events(); } };
$('#addEv').onclick = () => {
  const n = $('#evName').value.trim(), d = $('#evDate').value;
  if (!n || !d) return alert('Hãy nhập tên sự kiện và chọn ngày nhé.');
  S.events.push({ n, d }); save(); events(); $('#evName').value = ''; $('#evDate').value = '';
};

/* ===== Thông tin chung ===== */
function info() {
  const IF = [['nick1', 'Biệt danh của ' + S.a, 'text'], ['nick2', 'Biệt danh của ' + S.b, 'text'], ['meet', 'Nơi gặp nhau lần đầu', 'text'],
    ['food', 'Món ăn chung', 'text'], ['song', 'Bài hát của tụi mình', 'text'], ['dream', 'Ước mơ chung', 'text'],
    ['bdA', 'Sinh nhật ' + S.a, 'date'], ['bdB', 'Sinh nhật ' + S.b, 'date']];
  $('#infoBox').innerHTML = IF.map(([k, l, t]) => `<div><label>${esc(l)}</label><input data-k="${k}" type="${t}" value="${esc(S.info[k] || '')}"></div>`).join('');
}
$('#infoBox').oninput = e => { const k = e.target.dataset.k; if (k) { S.info[k] = e.target.value; save(); if (e.target.type == 'date') events(); } };

/* ===== Thẻ tình yêu + Lời nhắn buổi sáng ===== */
$('#flip').onclick = () => {
  const n = S.notes;
  $('#flip').textContent = n.length ? n[hash(F(new Date())) % n.length] : 'Hãy thêm vài câu ngọt ngào vào kho thẻ nhé!';
};
$('#flip').onkeydown = e => { if (e.key == 'Enter') e.target.click(); };
$('#addNote').onclick = () => { const v = $('#newNote').value.trim(); if (v) { S.notes.push(v); save(); $('#newNote').value = ''; alert('Đã thêm vào kho thẻ!'); } };
const words = t => t.trim().split(/\s+/).filter(Boolean).length;
$('#morning').oninput = () => { $('#wc').textContent = `${words($('#morning').value)}/50 từ`; };
$('#saveMorning').onclick = () => {
  const t = $('#morning').value.trim();
  if (words(t) > 50) return alert('Lời nhắn dài quá 50 từ, hãy rút gọn lại nhé.');
  S.morning = { t, d: F(new Date()) }; save(); mShow();
};
function mShow() {
  $('#morning').value = S.morning.t; $('#wc').textContent = `${words(S.morning.t)}/50 từ`;
  $('#mShow').innerHTML = S.morning.t ? '<button id="openM">☀️ Mở lời nhắn buổi sáng</button>' : '';
}
$('#mShow').onclick = e => { if (e.target.id == 'openM') $('#mShow').innerHTML = `<p>${esc(S.morning.t)} <small>(${S.morning.d})</small></p>`; };

/* ===== Album bí mật ===== */
let hc = 0, ht;
function unlock() { $('#lock').hidden = true; $('#gal').hidden = false; renderGal(); }
$('#heartLock').onclick = () => { hc++; clearTimeout(ht); ht = setTimeout(() => hc = 0, 1200); if (hc >= 3) { hc = 0; unlock(); } };
$('#pwBtn').onclick = () => {
  if ($('#pw').value.trim().toLowerCase() == S.pass.toLowerCase()) { $('#pw').value = ''; unlock(); }
  else alert('Sai mật mã rồi, thử lại nhé 🙈');
};
$('#relock').onclick = () => { $('#gal').hidden = true; $('#lock').hidden = false; };
function renderGal() {
  $('#galGrid').innerHTML = S.gal.map((g, i) => `<div class="pic"><img src="${g.src}" alt="${esc(g.cap)}"><button data-g="${i}" aria-label="Xóa ảnh">✕</button><small>${esc(g.cap)}</small></div>`).join('') || '<small>Chưa có ảnh nào. Hãy thêm ảnh riêng tư của hai đứa nhé.</small>';
}
$('#galGrid').onclick = e => { const i = e.target.dataset.g; if (i != null) { S.gal.splice(i, 1); save(); renderGal(); } };
$('#galUp').onchange = e => {
  [...e.target.files].forEach(f => pick(f, 1000, src => { S.gal.push({ src, cap: prompt('Chú thích cho ảnh này (có thể bỏ trống):') || '' }); save(); renderGal(); }));
  e.target.value = '';
};

/* ===== KẾ HOẠCH ĐI SIÊU THỊ & QUẢN LÝ LỊCH SỬ GIÁ / UPLOAD BILL ===== */
if (!S.shopping) S.shopping = [];
if (!S.dishes) S.dishes = [];
if (!S.shopHistory) S.shopHistory = [];
if (!S.receipts) S.receipts = [];

const shopModal = $('#shopModal');

$('#openShopModal').onclick = () => {
  renderShopModal();
  shopModal.showModal();
};

$('#closeShopModal').onclick = () => shopModal.close();
$('#saveAndCloseShop').onclick = () => {
  save();
  shopModal.close();
};

function renderShopModal() {
  renderDishes();
  renderHistoryTags();
  renderModalBill();
  renderReceipts();
}

function renderDishes() {
  const container = $('#dishTags');
  if (!container) return;
  container.innerHTML = S.dishes.map((dish, i) => `
    <span class="dish-chip">
      🍲 ${esc(dish)}
      <button data-del-dish="${i}" style="padding:0 4px; background:none; color:#b3124f; box-shadow:none;">✕</button>
    </span>
  `).join('') || '<small>Chưa chọn món nào định nấu.</small>';
}

$('#addDishBtn').onclick = () => {
  const input = $('#dishInput');
  const val = input.value.trim();
  if (val) {
    S.dishes.push(val);
    input.value = '';
    save();
    renderDishes();
    renderModalBill();
  }
};

$('#dishTags').onclick = e => {
  const idx = e.target.dataset.delDish;
  if (idx != null) {
    S.dishes.splice(idx, 1);
    save();
    renderDishes();
    renderModalBill();
  }
};

function renderHistoryTags() {
  const container = $('#historyTags');
  if (!container) return;
  const currentNames = S.shopping.map(i => i.name.toLowerCase());
  const availableHistory = S.shopHistory.filter(h => !currentNames.includes(h.name.toLowerCase()));

  container.innerHTML = availableHistory.map(item => `
    <span class="history-chip" data-add-hist="${esc(item.name)}" data-price="${item.price}">
      + ${esc(item.name)} ${item.price ? `(${item.price.toLocaleString('vi-VN')}đ)` : ''}
    </span>
  `).join('') || '<small>Chưa có gợi ý lịch sử (hệ thống sẽ tự học hỏi từ các món bạn từng mua).</small>';
}

$('#historyTags').onclick = e => {
  const name = e.target.dataset.addHist;
  const price = Number(e.target.dataset.price) || 0;
  if (name) {
    addItemToShop(name, price);
  }
};

function addItemToShop(name, price) {
  S.shopping.push({ name, price, done: false });
  // Cập nhật giá mới nhất vào lịch sử
  const histItem = S.shopHistory.find(h => h.name.toLowerCase() === name.toLowerCase());
  if (histItem) {
    histItem.price = price;
  } else {
    S.shopHistory.push({ name, price });
  }
  save();
  renderModalBill();
  renderHistoryTags();
}

$('#modalAddShopBtn').onclick = () => {
  const nameInput = $('#modalShopName');
  const priceInput = $('#modalShopPrice');
  const name = nameInput.value.trim();
  const price = Number(priceInput.value.trim()) || 0;

  if (!name) return alert('Hãy nhập tên món đồ cần mua!');

  addItemToShop(name, price);
  nameInput.value = '';
  priceInput.value = '';
};

function renderModalBill() {
  const listEl = $('#modalShopList');
  if (!listEl) return;

  const now = new Date();
  $('#billDateText').textContent = `Ngày lập: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`;

  const dishSummary = $('#billDishSummary');
  dishSummary.innerHTML = S.dishes.length 
    ? `<b>🍲 Món định nấu:</b> ${S.dishes.map(d => esc(d)).join(', ')}`
    : '<b>🍲 Món định nấu:</b> Chưa chọn món';

  let totalCost = 0;
  let boughtCount = 0;

  listEl.innerHTML = S.shopping.map((item, index) => {
    const priceNum = Number(item.price) || 0;
    totalCost += priceNum;
    if (item.done) boughtCount++;

    return `
      <li class="${item.done ? 'done' : ''}">
        <div class="shop-item-left">
          <input type="checkbox" data-modal-check="${index}" ${item.done ? 'checked' : ''}>
          <span class="item-title">${esc(item.name)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${priceNum > 0 ? `<span class="item-price">${priceNum.toLocaleString('vi-VN')}đ</span>` : ''}
          <button data-modal-del="${index}" style="padding: 2px 8px; font-size: 0.75rem;">✕</button>
        </div>
      </li>
    `;
  }).join('') || '<small style="display:block; text-align:center; padding:10px;">Bill đang trống. Hãy thêm đồ cần mua ở trên nhé!</small>';

  $('#modalShopSummary').textContent = `${boughtCount}/${S.shopping.length} món`;
  $('#modalShopTotal').textContent = `Tổng tiền: ${totalCost.toLocaleString('vi-VN')}đ`;
}

$('#modalShopList').onclick = e => {
  const checkIdx = e.target.dataset.modalCheck;
  const delIdx = e.target.dataset.modalDel;

  if (checkIdx != null) {
    S.shopping[checkIdx].done = e.target.checked;
    save();
    renderModalBill();
  } else if (delIdx != null) {
    S.shopping.splice(delIdx, 1);
    save();
    renderModalBill();
    renderHistoryTags();
  }
};

$('#clearBoughtModal').onclick = () => {
  if (!S.shopping.some(i => i.done)) return alert('Chưa có món nào được tích đã mua.');
  S.shopping = S.shopping.filter(i => !i.done);
  save();
  renderModalBill();
  renderHistoryTags();
};

/* Xuất bill thành file ảnh PNG */
$('#exportBillPngBtn').onclick = () => {
  const billArea = $('#billCaptureArea');
  if (!S.shopping.length && !S.dishes.length) return alert('Bill đang trống, hãy thêm danh sách trước khi xuất ảnh nhé!');

  html2canvas(billArea, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Bill_Sieu_Thi_${F(new Date())}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
};

/* Tải ảnh hóa đơn thực tế lên hệ thống */
$('#receiptUploadInput').onchange = e => {
  [...e.target.files].forEach(file => {
    pick(file, 1000, src => {
      S.receipts.push({ src, date: new Date().toLocaleDateString('vi-VN') });
      save();
      renderReceipts();
    });
  });
  e.target.value = '';
};

function renderReceipts() {
  const gallery = $('#receiptGallery');
  if (!gallery) return;
  gallery.innerHTML = S.receipts.map((rec, i) => `
    <div class="receipt-item">
      <img src="${rec.src}" alt="Hóa đơn ngày ${rec.date}">
      <button data-del-rec="${i}" title="Xóa">✕</button>
    </div>
  `).join('') || '<small style="grid-column:1/-1; text-align:center;">Chưa có ảnh hóa đơn nào được tải lên.</small>';
}

$('#receiptGallery').onclick = e => {
  const idx = e.target.dataset.delRec;
  if (idx != null) {
    S.receipts.splice(idx, 1);
    save();
    renderReceipts();
  }
};



/* ===== Cài đặt ===== */
$('#setBtn').onclick = () => {
  $('#sA').value = S.a; $('#sB').value = S.b; $('#sD').value = S.start; $('#sP').value = S.pass;
  $('#dlg').returnValue = ''; $('#dlg').showModal();
};
$('#dlg').onclose = () => {
  if ($('#dlg').returnValue != 'ok') return;
  S.a = $('#sA').value.trim() || 'Anh'; S.b = $('#sB').value.trim() || 'Em';
  S.start = $('#sD').value || S.start; S.pass = $('#sP').value.trim() || 'yeuem';
  save(); all(); countUp();
};
$('#wipe').onclick = () => { if (confirm('Xóa toàn bộ ảnh và dữ liệu đã lưu?')) { localStorage.removeItem('love'); location.reload(); } };
$('#themeSel').innerHTML = '<option value="auto">Giao diện: tự động</option>' + Object.entries(TH).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('');
$('#themeSel').value = S.theme;
$('#themeSel').onchange = e => { S.theme = e.target.value; save(); theme(); };

/* ===== Khởi động ===== */
function all() { theme(); hero(); ava(); events(); info(); mShow(); }
if (S.start == '2024-02-14') { S.start = '2026-09-05'; save(); }
$('#startPick').onchange = e => { if (!e.target.value) return; S.start = e.target.value; save(); all(); countUp(); };
all();
$('#openBtn').onclick = () => {
  $('#intro').hidden = true; $('#app').hidden = false; countUp(); tick(); setInterval(tick, 1000);
  const fx = $('#fx');
  setInterval(() => {
    const s = document.createElement('span');
    s.textContent = EM[Math.random() * EM.length | 0];
    s.style.cssText = `left:${Math.random() * 100}vw;font-size:${14 + Math.random() * 20}px;animation-duration:${6 + Math.random() * 6}s`;
    fx.append(s); setTimeout(() => s.remove(), 12000);
  }, 700);
};

/* ===== Xem ảnh phóng to (Lightbox) ===== */
(() => {
    const lightbox = document.getElementById("photoLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    const gallery = document.getElementById("galGrid");

    if (!lightbox || !lightboxImage || !gallery) return;

    let currentIndex = 0;

    function getImages() { return Array.from(gallery.querySelectorAll(".pic img")); }

    function showImage(index) {
        const images = getImages();
        if (!images.length) return;
        currentIndex = (index + images.length) % images.length;
        lightboxImage.src = images[currentIndex].src;
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImage.src = "";
        document.body.style.overflow = "";
    }

    gallery.addEventListener("click", function(event) {
        const image = event.target.closest(".pic img");
        if (!image) return;
        const images = getImages();
        const index = images.indexOf(image);
        if (index !== -1) showImage(index);
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(event) { if (event.target === lightbox) closeLightbox(); });
    prevBtn.addEventListener("click", function(event) { event.stopPropagation(); showImage(currentIndex - 1); });
    nextBtn.addEventListener("click", function(event) { event.stopPropagation(); showImage(currentIndex + 1); });

    document.addEventListener("keydown", function(event) {
        if (lightbox.hidden) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showImage(currentIndex - 1);
        if (event.key === "ArrowRight") showImage(currentIndex - 1);
    });
})();
// === TỔNG HỢP LOGIC TRONG SCRIPT.JS ===
document.addEventListener("DOMContentLoaded", () => {
    // 1. LOGIC QUẢN LÝ NHẠC VÀ VIDEO NẶNG (INDEXEDDB)
    const toggleBtn = document.getElementById("music-toggle-btn");
    const dropdown = document.getElementById("music-dropdown");
    const closeBtn = document.getElementById("music-close-btn");
    const audioElement = document.getElementById("audio-element");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const nowPlaying = document.getElementById("now-playing");

    const openSettingsBtn = document.getElementById("open-settings-btn");
    const settingsModal = document.getElementById("music-settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveMusicBtn = document.getElementById("save-music-btn");
    const uploadInput = document.getElementById("upload-music-file");
    const moodSelect = document.getElementById("settings-mood-select");

    let db;
    const request = indexedDB.open("LoveAppMusicDB", 1);

    request.onerror = function(event) {
        console.log("Lỗi mở cơ sở dữ liệu:", event);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("mediaStore")) {
            db.createObjectStore("mediaStore");
        }
    };

    function saveMediaToDB(mood, file, callback) {
        if (!db) {
            alert("Cơ sở dữ liệu đang khởi tạo, vui lòng thử lại sau giây lát!");
            return;
        }
        const transaction = db.transaction(["mediaStore"], "readwrite");
        const store = transaction.objectStore("mediaStore");
        const request = store.put(file, mood);

        request.onsuccess = () => callback(true);
        request.onerror = () => callback(false);
    }

    function getMediaFromDB(mood, callback) {
        if (!db) {
            callback(null);
            return;
        }
        const transaction = db.transaction(["mediaStore"], "readonly");
        const store = transaction.objectStore("mediaStore");
        const request = store.get(mood);

        request.onsuccess = (event) => callback(event.target.result);
        request.onerror = () => callback(null);
    }

    toggleBtn.addEventListener("click", () => dropdown.classList.toggle("hidden"));
    closeBtn.addEventListener("click", () => dropdown.classList.add("hidden"));

    openSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
    closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));

    saveMusicBtn.addEventListener("click", () => {
        const selectedMood = moodSelect.value;
        const file = uploadInput.files[0];

        if (!file) {
            alert("Vui lòng chọn một file nhạc hoặc video!");
            return;
        }

        saveMusicBtn.innerText = "Đang lưu...";
        saveMusicBtn.disabled = true;

        saveMediaToDB(selectedMood, file, function(success) {
            saveMusicBtn.innerText = "Lưu vào App";
            saveMusicBtn.disabled = false;
            if (success) {
                alert("Đã lưu video/nhạc thành công!");
                settingsModal.classList.add("hidden");
                uploadInput.value = "";
            } else {
                alert("Lưu thất bại, vui lòng thử lại!");
            }
        });
    });

    document.querySelectorAll(".mood-btn").forEach(button => {
        button.addEventListener("click", () => {
            const mood = button.getAttribute("data-mood");
            const moodName = button.innerText;

            getMediaFromDB(mood, function(fileBlob) {
                if (fileBlob) {
                    const fileURL = URL.createObjectURL(fileBlob);
                    audioElement.src = fileURL;
                    audioElement.play().then(() => {
                        playPauseBtn.innerText = "⏸️ Tạm dừng";
                        nowPlaying.innerText = `Đang phát (${moodName})`;
                    }).catch(err => {
                        console.log("Lỗi phát:", err);
                        alert("Không thể phát định dạng file này.");
                    });
                } else {
                    alert(`Thể loại "${moodName}" chưa có dữ liệu. Hãy bấm "⚙️ Thêm Nhạc/Video" để tải lên nhé!`);
                }
            });
        });
    });

    playPauseBtn.addEventListener("click", () => {
        if (audioElement.src) {
            if (audioElement.paused) {
                audioElement.play();
                playPauseBtn.innerText = "⏸️ Tạm dừng";
            } else {
                audioElement.pause();
                playPauseBtn.innerText = "▶️ Phát";
            }
        } else {
            alert("Vui lòng chọn một thể loại nhạc trước!");
        }
    });

    audioElement.addEventListener("ended", () => {
        audioElement.currentTime = 0;
        audioElement.play();
    });


    // 2. LOGIC HIỂN THỊ CÂU NÓI KÈM ÂM THANH VUI TAI (TING TING)
    const messages = [
        { icon: "💖", text: "Cảm ơn vì đã cùng nhau đi qua từng ngày bình yên." },
        { icon: "✨", text: "Hôm nay chắc chắn sẽ là một ngày may mắn và ngập tràn niềm vui!" },
        { icon: "☕", text: "Nhớ uống đủ nước và mỉm cười thật tươi nhé cậu!" },
        { icon: "🌸", text: "Yêu một người là cùng nhau hướng về một tương lai tươi sáng." },
        { icon: "💪", text: "Mọi thử thách ngoài kia sẽ nhẹ nhàng hơn vì tụi mình có nhau." },
        { icon: "🌟", text: "Nụ cười của cậu là năng lượng tuyệt vời nhất ngày hôm nay." },
        { icon: "💌", text: "Hạnh phúc không phải là điểm đến, mà là chặng đường chúng ta đang đi." }
    ];

    const toast = document.getElementById("motivation-toast");
    const toastIcon = document.getElementById("toast-icon");
    const toastMessage = document.getElementById("toast-message");

    // Hàm tạo âm thanh "ting ting" vui tai bằng lập trình
    function playNotificationSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            
            // Tạo 2 nốt nhạc đi lên (hiệu ứng ting ting)
            const notes = [523.25, 659.25]; // Nốt C5 và E5
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = "sine";
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.3);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + index * 0.1);
                osc.stop(ctx.currentTime + index * 0.1 + 0.3);
            });
        } catch (e) {
            console.log("Trình duyệt chặn âm thanh tự động:", e);
        }
    }

    if (toast && toastMessage) {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        toastIcon.innerText = randomMsg.icon;
        toastMessage.innerText = randomMsg.text;

        setTimeout(() => {
            toast.classList.add("toast-show");
            playNotificationSound(); // Phát âm thanh vui tai khi thông bảng xuất hiện
        }, 500);

        setTimeout(() => {
            toast.classList.remove("toast-show");
        }, 4500);
    }
});
// ==========================================
    // 3. LOGIC CHUỖI ĐIỂM DANH & REP CHUỖI HAI CHIỀU
    // ==========================================
    const streakCountEl = document.getElementById("streak-count");
    const streakStatusEl = document.getElementById("streak-status");
    const checkinBtn = document.getElementById("checkin-btn");

    let streakData = JSON.parse(localStorage.getItem("loveStreakData")) || {
        count: 0,
        lastCheckInDate: "",
        repStatus: "none" // "none", "waiting", "done"
    };

    const todayStr = new Date().toDateString();

    // Nếu sang ngày mới mà chưa rep, reset trạng thái chờ
    if (streakData.lastCheckInDate !== todayStr && streakData.repStatus === "done") {
        streakData.repStatus = "none";
    }

    function getFoodRewardByStreak(count) {
        if (count >= 100) return "💎 Mốc 100 Ngày: Kỷ niệm bách nhật! Quà tự chọn & Bữa tối lãng mạn trọn gói!";
        if (count >= 50) return "🌟 Mốc 50 Ngày: Buổi hẹn hò trọn gói A-Z do đối phương tài trợ!";
        if (count >= 30) return "🍖 Mốc 30 Ngày: Chầu Buffet / BBQ hoành tráng!";
        if (count >= 15) return "🍽️ Mốc 15 Ngày: Bữa tối hẹn hò (Được chọn quán & người kia thanh toán)";
        if (count >= 7) return "🧋 Mốc 7 Ngày: Món ăn vặt tự chọn (Bánh tráng, xiên bẩn, kem...)";
        if (count >= 3) return "☕ Mốc 3 Ngày: 1 ly Trà sữa / Cà phê chiều nay!";
        return "🌱 Thắp chuỗi mỗi ngày để mở khóa phần thưởng ẩm thực!";
    }

    function updateStreakUI() {
        if (streakCountEl) streakCountEl.innerText = `Chuỗi: ${streakData.count} ngày 🔥`;
        const currentReward = getFoodRewardByStreak(streakData.count);

        if (streakData.repStatus === "done") {
            if (streakStatusEl) streakStatusEl.innerText = `Đã Rep thành công! ${currentReward}`;
            if (checkinBtn) {
                checkinBtn.innerText = "Đã thắp ✔️";
                checkinBtn.classList.add("checked");
            }
        } else if (streakData.repStatus === "waiting") {
            if (streakStatusEl) streakStatusEl.innerText = "⏳ Đang đợi người ấy vào Rep lại chuỗi!";
            if (checkinBtn) {
                checkinBtn.innerText = "Đang chờ...";
                checkinBtn.classList.add("checked");
            }
        } else {
            if (streakStatusEl) streakStatusEl.innerText = currentReward;
            if (checkinBtn) {
                checkinBtn.innerText = "✨ Thắp chuỗi ngay";
                checkinBtn.classList.remove("checked");
            }
        }
    }

    if (checkinBtn) {
        checkinBtn.addEventListener("click", () => {
            if (streakData.repStatus === "done") {
                alert("Hôm nay hai bạn đã thắp và Rep chuỗi hoàn tất rồi nhé! ❤️");
                return;
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            // Nếu bấm thắp chuỗi lần đầu trong ngày
            if (streakData.repStatus === "none") {
                if (streakData.lastCheckInDate === yesterdayStr || streakData.lastCheckInDate === "") {
                    streakData.count += 1;
                } else if (streakData.count > 0) {
                    streakData.count = 1; // Đứt chuỗi reset về 1
                    alert("Ôi tiếc quá, chuỗi đã bị đứt do cách ngày. Bắt đầu thắp lại từ đầu nha!");
                } else {
                    streakData.count = 1;
                }

                streakData.lastCheckInDate = todayStr;
                streakData.repStatus = "waiting"; // Chuyển sang trạng thái chờ Rep
                localStorage.setItem("loveStreakData", JSON.stringify(streakData));
                
                updateStreakUI();
                alert("🔥 Đã thắp chuỗi thành công! Giờ hãy bảo người ấy mở app để bấm 'Rep chuỗi' hoàn tất nhé!");
            } 
            // Nếu đang ở trạng thái chờ (để người thứ 2 bấm Rep)
            else if (streakData.repStatus === "waiting") {
                streakData.repStatus = "done";
                localStorage.setItem("loveStreakData", JSON.stringify(streakData));
                
                updateStreakUI();
                alert(`🎉 Đã Rep chuỗi thành công! Chuỗi hiện tại: ${streakData.count} ngày.\n\nPhần thưởng mở khóa:\n${getFoodRewardByStreak(streakData.count)}`);
            }
        });
    }

    updateStreakUI();