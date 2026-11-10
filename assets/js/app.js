/* 恒瑞IMDT 行为层：守卫/弹层/toast/验证码/拍照/文件处理流水线/进度模拟 */
window.HRApp = (function () {
  /* ---------- 图标 ---------- */
  function svg(inner, s) {
    s = s || 20;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var I = {
    back: function (s) { return svg('<path d="M15 5l-7 7 7 7"/>', s); },
    close: function (s) { return svg('<path d="M6 6l12 12M18 6L6 18"/>', s); },
    check: function (s) { return svg('<path d="M4 12.5l5 5L20 6.5"/>', s); },
    search: function (s) { return svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/>', s); },
    plus: function (s) { return svg('<path d="M12 5v14M5 12h14"/>', s); },
    arrowR: function (s) { return svg('<path d="M5 12h14M13 6l6 6-6 6"/>', s); },
    camera: function (s) { return svg('<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2l1.4-2h7.8l1.4 2h1.2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/>', s); },
    image: function (s) { return svg('<rect x="3" y="5" width="18" height="15" rx="2.5"/><circle cx="8.6" cy="10" r="1.7"/><path d="M4 18l5-5 4 4 3-3 4 4"/>', s); },
    file: function (s) { return svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>', s); },
    fileImg: function (s) { return svg('<rect x="3" y="5" width="18" height="15" rx="2.5"/><circle cx="8.6" cy="10" r="1.7"/><path d="M4 18l5-5 4 4 3-3 4 4"/>', s); },
    trash: function (s) { return svg('<path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2m-8 0l1 13a1.5 1.5 0 0 0 1.5 1.4h5A1.5 1.5 0 0 0 16 20l1-13"/>', s); },
    phone: function (s) { return svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', s); },
    shield: function (s) { return svg('<path d="M12 2.5l7.5 3v6c0 4.8-3.2 8.4-7.5 10-4.3-1.6-7.5-5.2-7.5-10v-6z"/><path d="M9 12l2 2 4-4.5"/>', s); },
    users: function (s) { return svg('<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M15.5 5.5a3.5 3.5 0 0 1 0 6.4M17 14.5a6.5 6.5 0 0 1 4.5 5.5"/>', s); },
    folder: function (s) { return svg('<path d="M3 7a2 2 0 0 1 2-2h4l2.5 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', s); },
    heart: function (s) { return svg('<path d="M12 20.5S3.5 15.5 3.5 9.3A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.5 2.9c0 6.2-8.5 11.2-8.5 11.2z"/>', s); },
    kidney: function (s) { return svg('<path d="M6 3.5c3 0 4 2.5 4 5.5s-1 4-1 6.5 1.5 5.5 4 5.5 5-2 5-6c0-5-3-12-9.5-12-1 0-1.8.2-2.5.5z"/>', s); },
    tumor: function (s) { return svg('<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>', s); },
    scan: function (s) { return svg('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.5"/>', s); },
    lung: function (s) { return svg('<path d="M12 3v9M9 12c0-2-1.5-3.5-3-3.5S3 10 3 13v4a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2zM15 12c0-2 1.5-3.5 3-3.5S21 10 21 13v4a3 3 0 0 1-3 3h-1a2 2 0 0 1-2-2z"/>', s); },
    blood: function (s) { return svg('<path d="M12 2.8s6.5 7 6.5 11.6a6.5 6.5 0 0 1-13 0C5.5 9.8 12 2.8 12 2.8z"/>', s); },
    liver: function (s) { return svg('<path d="M3.5 8.5C7 6 11 7 13 10.5s1 6.5 6 7c-2 3-6 4-9.5 2.5S3 14 3.5 8.5z"/>', s); },
    bolt: function (s) { return svg('<path d="M13 2L4.5 13.5H11L9.5 22 19 10.5h-6.5z"/>', s); },
    hosp: function (s) { return svg('<path d="M4 21V8l8-5.5L20 8v13"/><path d="M9.5 21v-6h5v6M12 8.5v3M10.5 10h3"/>', s); },
    dept: function (s) { return svg('<path d="M12 3l2 4.2 4.6.7-3.3 3.2.8 4.6L12 13.5l-4.1 2.2.8-4.6L5.4 7.9 10 7.2z"/>', s); },
    logout: function (s) { return svg('<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H9"/>', s); },
    info: function (s) { return svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.2"/>', s); },
    clock: function (s) { return svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>', s); },
    doc: function (s) { return svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/>', s); }
  };

  /* ---------- toast & flash ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg, type) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.innerHTML = '<span class="t-dot"></span><span class="t-msg"></span>';
      document.body.appendChild(toastEl);
    }
    toastEl.className = 'toast ' + (type || '');
    toastEl.querySelector('.t-msg').textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  function flash(msg, type) { try { sessionStorage.setItem('hrimdt_flash', JSON.stringify({ msg: msg, type: type || '' })); } catch (e) { } }
  function consumeFlash() {
    try {
      var raw = sessionStorage.getItem('hrimdt_flash');
      if (raw) {
        sessionStorage.removeItem('hrimdt_flash');
        var f = JSON.parse(raw);
        setTimeout(function () { toast(f.msg, f.type); }, 350);
      }
    } catch (e) { }
  }
  document.addEventListener('DOMContentLoaded', consumeFlash);

  /* ---------- 通用弹窗 ---------- */
  var modalRoot = null;
  function ensureModalRoot() {
    if (!modalRoot) { modalRoot = document.createElement('div'); document.body.appendChild(modalRoot); }
    modalRoot.innerHTML = '';
    return modalRoot;
  }
  function confirmModal(opts) {
    return new Promise(function (resolve) {
      var root = ensureModalRoot();
      var mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML =
        '<div class="modal-card">' +
        '<div class="m-title">' + esc(opts.title || '确认操作') + '</div>' +
        '<div class="m-body">' + (opts.html || esc(opts.body || '')) + '</div>' +
        '<div class="m-foot">' +
        '<button class="btn btn-secondary" data-r="0">取消</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-r="1">' + esc(opts.confirmText || '确定') + '</button>' +
        '</div></div>';
      root.appendChild(mask);
      requestAnimationFrame(function () { mask.classList.add('open'); });
      mask.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-r]');
        if (b) {
          mask.classList.remove('open');
          setTimeout(function () { mask.remove(); }, 180);
          resolve(b.getAttribute('data-r') === '1');
        } else if (e.target === mask) {
          mask.classList.remove('open');
          setTimeout(function () { mask.remove(); }, 180);
          resolve(false);
        }
      });
    });
  }
  function infoModal(title, html) {
    var root = ensureModalRoot();
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML =
      '<div class="modal-card" style="max-width:480px">' +
      '<div class="m-title">' + esc(title) + '</div>' +
      '<div class="m-body modal-scroll" style="max-height:52vh">' + html + '</div>' +
      '<div class="m-foot"><button class="btn btn-primary" data-r="1">我知道了</button></div></div>';
    root.appendChild(mask);
    requestAnimationFrame(function () { mask.classList.add('open'); });
    mask.addEventListener('click', function (e) {
      if (e.target.closest('button[data-r]') || e.target === mask) {
        mask.classList.remove('open');
        setTimeout(function () { mask.remove(); }, 180);
      }
    });
  }
  function openConsentModal() {
    var c = window.HR_SEED.constants;
    infoModal(c.consentTitle, c.consentText.map(function (t) { return '<p style="margin-bottom:10px">' + esc(t) + '</p>'; }).join(''));
  }

  /* ---------- 人机验证（滑块） ---------- */
  function captchaModal() {
    return new Promise(function (resolve) {
      var root = ensureModalRoot();
      var mask = document.createElement('div');
      mask.className = 'modal-mask';
      mask.innerHTML =
        '<div class="modal-card" style="max-width:360px">' +
        '<div class="m-title">安全验证</div>' +
        '<div class="m-body">请完成下方人机验证，通过后将发送短信验证码</div>' +
        '<div style="margin-top:18px">' +
        '<div class="captcha-track" id="cap-track">' +
        '<div class="ct-fill" id="cap-fill"></div>' +
        '<div class="ct-text" id="cap-text">向右拖动滑块完成验证</div>' +
        '<div class="captcha-knob" id="cap-knob">' + I.arrowR(20) + '</div>' +
        '</div></div>' +
        '<div class="captcha-note">滑块验证仅用于防止机器人滥用</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn-link gray" id="cap-cancel">取消</button></div>' +
        '</div></div>';
      root.appendChild(mask);
      requestAnimationFrame(function () { mask.classList.add('open'); });

      var track = mask.querySelector('#cap-track');
      var knob = mask.querySelector('#cap-knob');
      var fill = mask.querySelector('#cap-fill');
      var text = mask.querySelector('#cap-text');
      var passed = false, settled = false, dragging = false, startX = 0, curX = 0;

      function close(ok) {
        if (settled) return;
        settled = true;
        mask.classList.remove('open');
        setTimeout(function () { mask.remove(); }, 180);
        resolve(ok);
      }
      mask.querySelector('#cap-cancel').addEventListener('click', function () { close(false); });
      mask.addEventListener('click', function (e) { if (e.target === mask) close(false); });

      function maxX() { return track.clientWidth - knob.offsetWidth - 4; }

      knob.addEventListener('pointerdown', function (e) {
        if (passed || settled) return;
        dragging = true;
        startX = e.clientX;
        try { knob.setPointerCapture(e.pointerId); } catch (err) { }
        track.classList.remove('shake');
      });
      knob.addEventListener('pointermove', function (e) {
        if (!dragging || passed) return;
        curX = Math.max(0, Math.min(maxX(), e.clientX - startX));
        knob.style.left = (2 + curX) + 'px';
        fill.style.width = (2 + curX + knob.offsetWidth / 2) + 'px';
        text.style.opacity = curX > 24 ? '.3' : '1';
      });
      function finishDrag() {
        if (!dragging || passed) return;
        dragging = false;
        if (curX >= maxX() - 3) {
          passed = true;
          track.classList.add('done');
          knob.classList.add('done');
          knob.innerHTML = I.check(20);
          text.style.opacity = '1';
          text.textContent = '验证通过';
          setTimeout(function () { close(true); }, 650);
        } else {
          curX = 0;
          knob.style.left = '2px';
          fill.style.width = '0';
          text.style.opacity = '1';
          track.classList.add('shake');
          setTimeout(function () { track.classList.remove('shake'); }, 440);
        }
      }
      knob.addEventListener('pointerup', finishDrag);
      knob.addEventListener('pointercancel', finishDrag);
    });
  }

  /* ---------- 验证码 ---------- */
  var cdTimers = {};
  function startCountdown(btn, seconds) {
    var s = seconds || 60;
    if (cdTimers[btn.dataset.cdKey]) return;
    btn.dataset.cdKey = 'cd' + Date.now();
    var key = btn.dataset.cdKey;
    var tick = function () {
      btn.disabled = true;
      btn.textContent = '重新获取(' + s + 's)';
      if (s <= 0) {
        clearInterval(cdTimers[key]);
        delete cdTimers[key];
        btn.disabled = false;
        btn.textContent = '获取验证码';
        return;
      }
      s--;
    };
    tick();
    cdTimers[key] = setInterval(tick, 1000);
  }
  function validPhone(phone) { return /^1[3-9]\d{9}$/.test(phone); }
  function sendCode(btn, validate, onSent) {
    var err = validate ? validate() : null;
    if (err) { toast(err, 'error'); return false; }
    captchaModal().then(function (ok) {
      if (!ok) return;
      toast('验证码已发送（演示验证码：888888，任意6位数字可用）', 'success');
      startCountdown(btn);
      if (onSent) onSent();
    });
    return true;
  }

  /* ---------- 拍照弹层（移动端） ---------- */
  function openCameraModal(onDone) {
    var root = ensureModalRoot();
    var overlay = document.createElement('div');
    overlay.className = 'camera-overlay';
    overlay.innerHTML =
      '<div class="cam-top"><span class="zoom-chip">1×</span><span style="font-size:13px;font-weight:600;color:rgba(255,255,255,.85)">拍摄材料</span><button class="cam-close">' + I.close(18) + '</button></div>' +
      '<div class="cam-view"><div class="finder"><span class="c c1"></span><span class="c c2"></span><span class="c c3"></span><span class="c c4"></span><div class="flash"></div></div></div>' +
      '<div class="cam-guide">请将材料完整放入框内<br>保持手机与材料平行，避免反光和阴影</div>' +
      '<div class="cam-shutter-row"><span class="cam-ghost"></span><button class="shutter" title="拍摄"></button><span class="cam-ghost"></span></div>' +
      '<div class="cam-bottom"><button class="btn" data-a="album">' + I.image(18) + '相册</button><button class="btn" data-a="local">' + I.file(18) + '本地文件</button></div>';
    root.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    var close = function () { overlay.classList.remove('open'); setTimeout(function () { overlay.remove(); }, 200); };
    var filePick = function (accept) {
      var inp = document.createElement('input');
      inp.type = 'file';
      if (accept) inp.accept = accept;
      inp.onchange = function () {
        if (inp.files && inp.files[0]) {
          var f = inp.files[0];
          close();
          onDone({ name: f.name, size: fmtSize(f.size), source: accept ? 'album' : 'file' });
        }
      };
      inp.click();
    };
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('.cam-close')) { close(); return; }
      var a = e.target.closest('[data-a]');
      if (a) { filePick(a.getAttribute('data-a') === 'album' ? 'image/*' : null); return; }
      if (e.target.closest('.shutter')) {
        var flash = overlay.querySelector('.flash');
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
        setTimeout(function () {
          close();
          var d = new Date();
          onDone({ name: '拍照_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.jpg', size: (0.8 + Math.random() * 1.7).toFixed(1) + ' MB', source: 'camera' });
        }, 480);
      }
    });
  }

  /* ---------- 文件处理流水线（Web 上传） ---------- */
  var OK_EXT = ['pdf', 'jpg', 'jpeg', 'png'];
  function makeFileEntry(file) {
    var name = file.name || '未命名文件';
    var ext = name.split('.').pop().toLowerCase();
    return { name: name, ext: ext, size: fmtSize(file.size || 1024), state: OK_EXT.indexOf(ext) >= 0 ? 'uploading' : 'failed', progress: 0 };
  }
  function processFileEntry(entry, hooks) {
    if (entry.state === 'failed') {
      hooks.onUpdate(entry);
      return;
    }
    var p = 0;
    var up = setInterval(function () {
      p += 12 + Math.random() * 22;
      if (p >= 100) {
        p = 100; clearInterval(up);
        entry.progress = 100;
        entry.state = 'processing';
        hooks.onUpdate(entry);
        setTimeout(function () {
          entry.state = 'done';
          hooks.onUpdate(entry);
          hooks.onDone && hooks.onDone(entry);
        }, 1100 + Math.random() * 900);
        return;
      }
      entry.progress = Math.floor(p);
      hooks.onUpdate(entry);
    }, 220);
  }

  /* ---------- 进度模拟（分析中） ---------- */
  var PROGRESS_STEPS = [
    { name: '材料上传', desc: '材料已加密上传' },
    { name: '隐私脱敏', desc: '隐私信息将自动脱敏' },
    { name: '结构化解析', desc: '正在提取病史、检查与治疗信息' },
    { name: 'MDT 分析', desc: '多学科协同分析，生成诊疗建议' }
  ];
  var simTimers = [];
  function runProgressSimulation(patientId, opts) {
    clearSimTimers();
    var tick = function () {
      var p = window.HRStore.getPatientById(patientId);
      if (!p || p.status === 'completed') {
        clearSimTimers();
        opts.onDone && opts.onDone(p);
        return;
      }
      p = window.HRStore.advanceProgress(patientId);
      opts.onUpdate(p);
      if (p.status === 'completed') {
        clearSimTimers();
        opts.onDone && opts.onDone(p);
        return;
      }
      simTimers.push(setTimeout(tick, (opts.interval || 2200) + Math.random() * 800));
    };
    simTimers.push(setTimeout(tick, 1600));
  }
  function clearSimTimers() { simTimers.forEach(clearTimeout); simTimers = []; }
  window.addEventListener('pagehide', clearSimTimers);

  /* ---------- 守卫与认证 ---------- */
  function guard(portal) {
    var login = portal === 'web' ? 'web-login.html' : 'user-login.html';
    var s = window.HRStore.getSession();
    if (!s) { flash('请先登录', 'error'); location.replace(login); return null; }
    var u = window.HRStore.findUserById(s.userId);
    if (!u) { window.HRStore.clearSession(); flash('账号不存在', 'error'); location.replace(login); return null; }
    return u;
  }
  function doLogin(phone) {
    var u = window.HRStore.findUserByPhone(phone);
    if (!u) return { error: '账号不存在，请先注册' };
    window.HRStore.setSession(u);
    window.HRStore.touchLogin(u.id);
    return { user: u };
  }
  function logout(portal) {
    var login = portal === 'web' ? 'web-login.html' : 'user-login.html';
    return confirmModal({
      title: '退出登录',
      body: '确定退出当前账号吗？',
      confirmText: '退出',
      danger: true
    }).then(function (ok) {
      if (ok) { window.HRStore.clearSession(); flash('已退出登录'); location.replace(login); }
      return ok;
    });
  }

  /* ---------- Web 端顶栏 ---------- */
  function webChrome(user, active) {
    var nav = document.getElementById('nav');
    if (nav) {
      nav.innerHTML = '<a href="web-patients.html" class="' + (active === 'patients' ? 'active' : '') + '">患者管理</a>';
    }
    var un = document.getElementById('tb-user');
    if (un) un.textContent = user.name;
    var ur = document.getElementById('tb-role');
    if (ur) { ur.className = 'tag tag-doctor'; ur.textContent = '医生'; }
    var lo = document.getElementById('tb-logout');
    if (lo) lo.addEventListener('click', function () { logout('web'); });
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function fileIcon(name) {
    var ext = String(name || '').split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].indexOf(ext) >= 0) return I.fileImg(18);
    return I.file(18);
  }
  function statusTag(p) {
    return p.status === 'completed'
      ? '<span class="tag tag-completed">' + I.check(13) + '已完成</span>'
      : '<span class="tag tag-analyzing">' + spin(13) + '分析中</span>';
  }
  function spin(s) { return '<span class="spin" style="width:' + s + 'px;height:' + s + 'px"></span>'; }

  return {
    I: I,
    toast: toast, flash: flash, consumeFlash: consumeFlash,
    confirmModal: confirmModal, infoModal: infoModal, openConsentModal: openConsentModal,
    startCountdown: startCountdown, sendCode: sendCode, validPhone: validPhone, captchaModal: captchaModal,
    openCameraModal: openCameraModal,
    makeFileEntry: makeFileEntry, processFileEntry: processFileEntry, OK_EXT: OK_EXT,
    PROGRESS_STEPS: PROGRESS_STEPS, runProgressSimulation: runProgressSimulation, clearSimTimers: clearSimTimers,
    guard: guard, doLogin: doLogin, logout: logout, webChrome: webChrome,
    esc: esc, fmtSize: fmtSize, getParam: getParam, fileIcon: fileIcon, statusTag: statusTag, spin: spin
  };
})();
