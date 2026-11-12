window.HRSlides = (function () {
  var A = window.HRApp, S = window.HRStore;
  var listeners = [], processing = {}, timer = null, activeOverlay = null;
  var disclaimer = '内容仅供医生参考，最终方案以临床评估为准';

  function userId() {
    var session = S.getSession();
    return session && session.userId;
  }
  function patientFor(id, completed) {
    var patient = S.getPatientById(id);
    if (!patient || patient.creatorId !== userId()) throw new Error('无权查看该病例');
    if (completed && (patient.status !== 'completed' || !patient.result)) throw new Error('请等待 MDT 分析完成后再生成幻灯');
    return patient;
  }
  function recordFor(id) {
    var record = S.listSlides().find(function (r) { return r.id === id; });
    if (!record || record.creatorId !== userId()) throw new Error('记录不存在或无权查看');
    patientFor(record.patientId);
    return record;
  }
  function report(error) { A.toast(error.message || '操作未完成，请重试', 'error'); }
  function formatTime(ms) {
    var d = new Date(ms);
    function pad(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function snapshot(p) {
    return JSON.parse(JSON.stringify({ code: p.code, gender: p.gender, age: p.age, disease: p.disease,
      materialCount: p.materials.length, timeline: p.timeline || [], result: p.result, systems: p.systems || [] }));
  }
  function wrap(text) {
    var lines = [], line = '', width = 0;
    Array.from(String(text)).forEach(function (char) {
      var size = /[\u0000-\u00ff]/.test(char) ? 0.55 : 1;
      if (char === '\n' || width + size > 38) {
        lines.push(line); line = ''; width = 0;
      }
      if (char !== '\n') { line += char; width += size; }
    });
    if (line) lines.push(line);
    return lines;
  }
  function buildPages(record) {
    var p = record.snapshot, r = p.result;
    var pages = [{ title: record.title, cover: true, lines: [p.code, p.disease,
      '汇报人：' + record.creatorName, formatTime(record.createdAt)] }];
    function section(title, texts) {
      var lines = [];
      texts.forEach(function (text) { lines = lines.concat(wrap(text)); });
      for (var i = 0; i < lines.length; i += 9) {
        pages.push({ title: title + (i ? '（续）' : ''), lines: lines.slice(i, i + 9) });
      }
    }
    section('病例基本信息', ['病例编号：' + p.code, '性别 / 年龄：' + (p.gender || '未填写') + ' / ' + (p.age == null ? '未填写' : p.age + '岁'),
      '疾病：' + p.disease, '已提交材料：' + p.materialCount + ' 份']);
    if (record.instructions) section('汇报说明', [record.instructions]);
    if (p.timeline.length) section('诊疗时间线', p.timeline.map(function (t) { return t.date + ' · ' + t.title + '\n' + t.desc; }));
    section('MDT 综合建议', [r.overall].concat((r.keyPoints || []).map(function (k) { return '重点关注：' + k.k + (k.sub ? ' · ' + k.sub : ''); })));
    (r.departments || []).forEach(function (d) {
      section(d.name + '建议', [d.summary].concat((d.points || []).map(function (pt) { return pt.label + '：' + pt.text; })));
    });
    if (p.systems.length) section('多系统累及与指标', p.systems.reduce(function (lines, s) {
      return lines.concat([s.system + (s.note ? ' · ' + s.note : '')], (s.metrics || []).map(function (m) {
        return m.name + '：' + m.value + (m.unit ? ' ' + m.unit : '') + '（' + ({ up: '上升', down: '下降', flat: '平稳' }[m.trend] || '未标注趋势') + '）';
      }));
    }, []));
    section('使用说明', [r.disclaimer || disclaimer, '此文件为原型演示产物，基于本次提交时的病例资料生成。', '使用前请核对原始材料与医学内容，不替代临床判断。']);
    return pages;
  }
  function initialize() {
    if (localStorage.getItem('hrimdt_slides_v1') !== null) return;
    var records = [];
    ['p_001', 'p_002'].forEach(function (id) {
      var p = S.getPatientById(id);
      if (!p || p.status !== 'completed' || !p.result) return;
      ['success', 'failed'].forEach(function (status, index) {
        var createdAt = Date.now() - (index ? 3600000 : 86400000);
        var record = { id: 'slide_demo_' + id + '_' + status, patientId: p.id, creatorId: p.creatorId,
          creatorName: p.creatorName, title: '病例分享-' + p.code + '-' + p.disease,
          instructions: '', status: status, createdAt: createdAt, startedAt: createdAt,
          readyAt: createdAt, completedAt: status === 'success' ? createdAt + 15000 : null,
          failureReason: status === 'failed' ? '生成服务暂时不可用，请重新生成。' : '',
          attempt: 1, snapshot: snapshot(p), pages: [] };
        if (status === 'success') record.pages = buildPages(record);
        records.push(record);
      });
    });
    S.initSlides(records);
  }
  function createPptx(record) {
    if (typeof window.PptxGenJS !== 'function') throw new Error('幻灯导出组件未加载，请刷新页面重试');
    var pptx = new window.PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = record.creatorName;
    pptx.subject = 'MDT 病例分享';
    pptx.title = record.title;
    pptx.company = '恒瑞IMDT';
    pptx.lang = 'zh-CN';
    pptx.theme = { headFontFace: 'Microsoft YaHei', bodyFontFace: 'Microsoft YaHei', lang: 'zh-CN' };
    record.pages.forEach(function (page, i) {
      var slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, line: { color: '1B5449' }, fill: { color: '1B5449' } });
      slide.addText('恒瑞IMDT  /  MDT 病例分享', { x: 0.65, y: 0.32, w: 10, h: 0.25, fontSize: 10, color: '5E7370', margin: 0 });
      if (page.cover) {
        slide.addShape(pptx.ShapeType.rect, { x: 11.8, y: 0.12, w: 1.53, h: 7.38, line: { color: 'EBF5F2' }, fill: { color: 'EBF5F2' } });
        slide.addText(page.title, { x: 0.85, y: 2.0, w: 10.6, h: 1.8, fontSize: 30, bold: true, color: '1B5449', margin: 0, breakLine: false, fit: 'shrink' });
        slide.addText(page.lines.join('\n'), { x: 0.85, y: 4.1, w: 10.4, h: 1.4, fontSize: 15, color: '5E7370', margin: 0 });
      } else {
        slide.addText(page.title, { x: 0.65, y: 0.94, w: 12, h: 0.55, fontSize: 26, color: '1B5449', bold: true, margin: 0, fit: 'shrink' });
        slide.addText(page.lines.join('\n'), { x: 0.72, y: 1.95, w: 11.9, h: 4.65, fontSize: 18, color: '0F2B2F', margin: 0, breakLine: false, paraSpaceAfterPt: 8, fit: 'shrink' });
      }
      slide.addText(disclaimer, { x: 0.65, y: 7.01, w: 11.4, h: 0.2, fontSize: 8, color: '5E7370', margin: 0 });
      slide.addText((i + 1) + ' / ' + record.pages.length, { x: 12, y: 7.01, w: 0.7, h: 0.2, fontSize: 9, color: '5E7370', margin: 0, align: 'right' });
    });
    return pptx.write({ outputType: 'blob' });
  }
  function notify() { listeners.forEach(function (fn) { fn(); }); }
  async function reconcile() {
    var records;
    try { records = S.listSlides(); } catch (e) { report(new Error('幻灯记录无法读取，请检查浏览器本地数据')); return; }
    records.filter(function (r) { return r.creatorId === userId() && r.status === 'generating' && r.readyAt <= Date.now(); }).forEach(async function (r) {
      if (processing[r.id]) return;
      processing[r.id] = true;
      try {
        patientFor(r.patientId, true);
        r.pages = buildPages(r);
        await createPptx(r);
        var latest = recordFor(r.id);
        if (latest.status !== 'generating' || latest.attempt !== r.attempt) return;
        r.status = 'success'; r.completedAt = Date.now(); r.failureReason = '';
        S.saveSlide(r);
        A.toast('幻灯生成成功，可查看或下载', 'success');
      } catch (e) {
        try {
          var current = recordFor(r.id);
          if (current.status === 'generating' && current.attempt === r.attempt) {
            current.status = 'failed'; current.failureReason = e.message;
            S.saveSlide(current);
          }
        } catch (storageError) { report(storageError); }
      } finally { delete processing[r.id]; notify(); }
    });
  }
  function overlay(html, kind) {
    if (activeOverlay) activeOverlay.close();
    var previousFocus = document.activeElement;
    var root = document.createElement('div');
    root.className = 'slides-overlay ' + kind;
    root.innerHTML = html;
    var siblings = Array.from(document.body.children).map(function (el) { return { el: el, inert: el.inert }; });
    siblings.forEach(function (item) { item.el.inert = true; });
    var oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(root);
    var handle = { root: root, close: function () {
      root.remove(); document.body.style.overflow = oldOverflow;
      siblings.forEach(function (item) { item.el.inert = item.inert; });
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      if (activeOverlay === handle) activeOverlay = null;
    } };
    activeOverlay = handle;
    root.addEventListener('click', function (e) { if (e.target === root || e.target.closest('[data-close]')) handle.close(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); handle.close(); }
      if (e.key === 'Tab') {
        var focusables = Array.from(root.querySelectorAll('button:not([disabled]),input,textarea,a[href]')).filter(function (el) { return el.offsetParent !== null; });
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    root.querySelector('input,button').focus();
    return handle;
  }
  function openGenerate(patientId, onCreated) {
    try {
      var p = patientFor(patientId, true);
      var handle = overlay('<form class="slides-form" role="dialog" aria-modal="true" aria-labelledby="slides-dialog-title">' +
        '<div class="slides-dialog-head"><div><h2 id="slides-dialog-title">生成 MDT PPT</h2><p>为病例生成多学科会诊讨论使用的幻灯</p></div><button type="button" class="slides-close" data-close aria-label="关闭">' + A.I.close(20) + '</button></div>' +
        '<div class="slides-form-body"><div class="slides-case-label">' + A.I.folder(16) + A.esc(p.code) + '<span>' + A.esc(p.disease) + '</span></div>' +
        '<div class="field"><label class="label" for="slides-title">PPT 标题 <span class="req">*</span></label><input class="input" id="slides-title" maxlength="80" required value="' + A.esc('病例分享-' + p.code + '-' + p.disease) + '"><div class="slides-field-note">最多 80 字</div></div>' +
        '<div class="field"><label class="label" for="slides-instructions">自定义说明 <span class="slides-optional">选填</span></label><textarea class="input" id="slides-instructions" maxlength="500" placeholder="请输入本次 MDT 汇报的说明，如重点关注心肾功能与治疗耐受性"></textarea><div class="slides-field-note">说明将作为汇报说明页保留，最多 500 字</div></div>' +
        '<div class="slides-form-error" role="alert"></div></div><div class="slides-dialog-foot"><div class="slides-generation-note">预计生成时间约 10 分钟，生成期间可操作其他任务。<small>原型演示约 15 秒完成，记录保存在本浏览器。</small></div>' +
        '<div class="slides-dialog-actions"><button type="button" class="btn btn-secondary btn-sm" data-close>取消</button><button type="submit" class="btn btn-primary btn-sm">开始生成</button></div></div></form>', 'slides-generate');
      handle.root.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var title = handle.root.querySelector('#slides-title').value.trim();
        var instructions = handle.root.querySelector('#slides-instructions').value.trim();
        var error = handle.root.querySelector('.slides-form-error');
        if (!title) { error.textContent = '请输入 PPT 标题'; handle.root.querySelector('#slides-title').focus(); return; }
        if (title.length > 80 || instructions.length > 500) { error.textContent = '标题或说明超过字数限制'; return; }
        try {
          var current = patientFor(patientId, true);
          var now = Date.now();
          var record = { id: 'slide_' + crypto.randomUUID(), patientId: current.id, creatorId: current.creatorId,
            creatorName: S.findUserById(userId()).name, title: title, instructions: instructions,
            status: 'generating', createdAt: now, startedAt: now, readyAt: now + 15000,
            completedAt: null, failureReason: '', attempt: 1, snapshot: snapshot(current), pages: [] };
          S.saveSlide(record); handle.close(); notify();
          A.toast('已开始生成，可在幻灯生成记录中查看进度', 'success');
          if (onCreated) onCreated(record);
        } catch (err) { error.textContent = err.message || '记录保存失败，请检查浏览器存储空间'; }
      });
    } catch (e) { report(e); }
  }
  async function download(id) {
    try {
      var record = recordFor(id);
      if (record.status !== 'success') throw new Error('请等待幻灯生成成功后下载');
      var blob = await createPptx(record);
      recordFor(id);
      var url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = record.title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_') + '.pptx';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    } catch (e) { report(e); }
  }
  function preview(id) {
    try {
      var r = recordFor(id);
      if (r.status !== 'success') throw new Error('请等待幻灯生成成功后查看');
      var handle = overlay('<section class="slides-drawer" role="dialog" aria-modal="true" aria-labelledby="slides-preview-title">' +
        '<header class="slides-preview-head"><div><h2 id="slides-preview-title">幻灯生成预览</h2><p>' + A.esc(r.title) + '</p></div><button class="slides-close" data-close aria-label="关闭预览">' + A.I.close(20) + '</button></header>' +
        '<div class="slides-preview-scroll">' + r.pages.map(function (page, i) {
          return '<article class="slides-paper ' + (page.cover ? 'slides-cover' + (Array.from(page.title).length > 50 ? ' slides-cover-long' : '') : '') + '" id="slides-page-' + i + '">' +
            '<div class="slides-paper-brand">恒瑞IMDT <span>/ MDT 病例分享</span></div><div class="slides-paper-content"><h3>' + A.esc(page.title) + '</h3><div class="slides-paper-lines">' + page.lines.map(function (line) { return '<p>' + A.esc(line) + '</p>'; }).join('') + '</div></div>' +
            '<footer><span>' + A.esc(disclaimer) + '</span><span>' + (i + 1) + ' / ' + r.pages.length + '</span></footer></article>';
        }).join('') + '</div><footer class="slides-preview-controls"><div class="slides-page-buttons"><button class="btn btn-secondary btn-sm" data-page="-1" aria-label="上一页">' + A.I.back(16) + '</button><span aria-live="polite" class="slides-page-number">1 / ' + r.pages.length + '</span><button class="btn btn-secondary btn-sm" data-page="1" aria-label="下一页">' + A.I.arrowR(16) + '</button></div><button class="btn btn-primary btn-sm" data-download>' + A.I.download(16) + '下载 PPT</button></footer></section>', 'slides-preview');
      var scroll = handle.root.querySelector('.slides-preview-scroll'), pageIndex = 0;
      function update() {
        var papers = Array.from(scroll.querySelectorAll('.slides-paper'));
        pageIndex = papers.reduce(function (best, paper, i) {
          return Math.abs(paper.offsetTop - scroll.scrollTop) < Math.abs(papers[best].offsetTop - scroll.scrollTop) ? i : best;
        }, 0);
        handle.root.querySelector('.slides-page-number').textContent = (pageIndex + 1) + ' / ' + r.pages.length;
        handle.root.querySelector('[data-page="-1"]').disabled = pageIndex === 0;
        handle.root.querySelector('[data-page="1"]').disabled = pageIndex === r.pages.length - 1;
      }
      scroll.addEventListener('scroll', update);
      handle.root.querySelectorAll('[data-page]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var next = Math.max(0, Math.min(r.pages.length - 1, pageIndex + Number(btn.dataset.page)));
          scroll.scrollTo({ top: scroll.querySelectorAll('.slides-paper')[next].offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        });
      });
      handle.root.querySelector('[data-download]').addEventListener('click', function () { download(id); });
      update();
    } catch (e) { report(e); }
  }
  function statusTag(record) {
    if (record.status === 'success') return '<span class="tag tag-completed">' + A.I.check(12) + '生成成功</span>';
    if (record.status === 'failed') return '<span class="tag slides-tag-failed">' + A.I.close(12) + '生成失败</span>';
    return '<span class="tag tag-analyzing">' + A.spin(12) + '生成中</span>';
  }
  function actions(r) {
    var buttons = r.status === 'success' ? [['view', '查看'], ['download', '下载']] : r.status === 'failed' ? [['retry', '重新生成']] : [];
    if (r.status !== 'generating') buttons.push(['delete', '删除']);
    return buttons.map(function (item) { return '<button class="btn-link ' + (item[0] === 'delete' ? 'danger' : '') + '" data-action="' + item[0] + '" data-id="' + A.esc(r.id) + '">' + item[1] + '</button>'; }).join('') || '<span class="slides-muted">完成后可查看</span>';
  }
  function mount(container, options) {
    if (typeof container === 'string') container = document.querySelector(container);
    var owner = userId(), state = { query: '', status: '', page: 1 }, pageSize = 10, lastRendered = '';
    if (!owner || !container) return;
    try { initialize(); } catch (e) { report(e); }
    var patientId = options.patientId;
    container.classList.add('slides-records');
    var allHref = options.portal === 'web' ? 'web-slides.html' : 'user-slides.html';
    container.innerHTML = '<div class="slides-list-head"><div><h2>' + (patientId ? '幻灯生成记录' : '全部幻灯生成记录') + '</h2><p>' + (patientId ? '查看本病例的幻灯生成进度与产物' : '集中查看幻灯的生成时间、状态与下载入口') + '</p></div>' +
      (patientId ? '<a class="btn-link" href="' + allHref + '">全部记录 ' + A.I.arrowR(14) + '</a>' : '') + '</div>' +
      '<div class="slides-filters"><label class="slides-search">' + A.I.search(17) + '<input type="search" aria-label="搜索幻灯标题或病例编号" placeholder="搜索幻灯标题' + (patientId ? '' : '或病例编号') + '"></label><select aria-label="生成状态筛选"><option value="">全部状态</option><option value="generating">生成中</option><option value="success">生成成功</option><option value="failed">生成失败</option></select></div>' +
      '<div class="slides-list-body"></div><div class="slides-pagination"></div>';
    var body = container.querySelector('.slides-list-body'), pagination = container.querySelector('.slides-pagination');
    function render() {
      if (userId() !== owner) {
        container.innerHTML = '';
        if (activeOverlay) activeOverlay.close();
        location.replace(options.portal === 'web' ? 'web-login.html' : 'user-login.html');
        return;
      }
      try {
        if (patientId) patientFor(patientId);
        var patients = S.listPatientsByCreator(owner).map(function (p) { return p.id; });
        var owned = S.listSlides().filter(function (r) { return r.creatorId === owner && patients.indexOf(r.patientId) >= 0 && (!patientId || r.patientId === patientId); });
        var records = owned.filter(function (r) { return (!state.status || r.status === state.status) && (!state.query || (r.title + ' ' + r.snapshot.code).toLowerCase().indexOf(state.query.toLowerCase()) >= 0); }).sort(function (a, b) { return b.createdAt - a.createdAt; });
        var maxPage = Math.max(1, Math.ceil(records.length / pageSize));
        state.page = Math.min(state.page, maxPage);
        var start = (state.page - 1) * pageSize, visible = records.slice(start, start + pageSize);
        var signature = JSON.stringify([state, records, owned.length]);
        if (signature === lastRendered) return;
        lastRendered = signature;
        var cols = patientId ? 5 : 6;
        body.innerHTML = '<div class="table-wrap slides-table-wrap"><table class="table slides-table"><thead><tr><th>生成时间</th><th>幻灯标题</th><th>生成类型</th>' + (!patientId ? '<th>病例编号</th>' : '') + '<th>生成状态</th><th>操作</th></tr></thead><tbody>' + visible.map(function (r) {
          return '<tr><td class="num">' + formatTime(r.createdAt) + '</td><td class="slides-title-cell">' + A.esc(r.title) + '</td><td><span class="slides-type">病例分享 PPT</span></td>' + (!patientId ? '<td class="num">' + A.esc(r.snapshot.code) + '</td>' : '') + '<td>' + statusTag(r) + (r.status === 'failed' ? '<div class="slides-failure">' + A.esc(r.failureReason) + '</div>' : '') + '</td><td><div class="slides-actions">' + actions(r) + '</div></td></tr>';
        }).join('') + (!visible.length ? '<tr><td colspan="' + cols + '"><div class="empty-state"><div class="es-ic">' + A.I.slides(26) + '</div><div class="es-t">' + (owned.length ? '没有匹配的记录' : '暂无幻灯生成记录') + '</div><div class="es-s">' + (owned.length ? '尝试其他关键词或调整状态筛选' : '在已完成分析的病例详情中，点击“生成幻灯”开始') + '</div></div></td></tr>' : '') + '</tbody></table></div>' +
          '<div class="slides-mobile-list">' + visible.map(function (r) {
            return '<article class="card slides-record-card"><div class="slides-record-top"><span class="slides-type">病例分享 PPT</span>' + statusTag(r) + '</div><h3>' + A.esc(r.title) + '</h3>' + (!patientId ? '<div class="slides-card-code">' + A.esc(r.snapshot.code) + '</div>' : '') + '<div class="slides-card-time">' + A.I.clock(13) + formatTime(r.createdAt) + '</div>' + (r.status === 'failed' ? '<div class="slides-failure">' + A.esc(r.failureReason) + '</div>' : '') + (r.status === 'generating' ? '<div class="slides-generation-hint">生成期间可离开，稍后在此查看</div>' : '') + '<div class="slides-actions">' + actions(r) + '</div></article>';
          }).join('') + (!visible.length ? '<div class="card empty-state"><div class="es-ic">' + A.I.slides(26) + '</div><div class="es-t">' + (owned.length ? '没有匹配的记录' : '暂无幻灯生成记录') + '</div><div class="es-s">' + (owned.length ? '调整关键词或筛选条件' : '前往已完成的病例，点击“生成幻灯”') + '</div></div>' : '') + '</div>';
        pagination.innerHTML = '<span>' + (records.length ? '第 ' + (start + 1) + '–' + Math.min(start + pageSize, records.length) + ' 条 / ' : '') + '共 ' + records.length + ' 条记录</span><div><button class="btn btn-secondary btn-sm" data-turn="-1" aria-label="上一页记录" ' + (state.page === 1 ? 'disabled' : '') + '>' + A.I.back(14) + '</button><span>' + state.page + ' / ' + maxPage + '</span><button class="btn btn-secondary btn-sm" data-turn="1" aria-label="下一页记录" ' + (state.page === maxPage ? 'disabled' : '') + '>' + A.I.arrowR(14) + '</button></div>';
      } catch (e) { body.textContent = '记录无法读取：' + e.message; pagination.innerHTML = ''; }
    }
    container.querySelector('input').addEventListener('input', function (e) { state.query = e.target.value.trim(); state.page = 1; render(); });
    container.querySelector('select').addEventListener('change', function (e) { state.status = e.target.value; state.page = 1; render(); });
    container.addEventListener('click', async function (e) {
      var turn = e.target.closest('[data-turn]');
      if (turn) { state.page += Number(turn.dataset.turn); render(); return; }
      var btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;
      var id = btn.dataset.id, action = btn.dataset.action;
      try {
        var r = recordFor(id);
        if (action === 'view') { preview(id); return; }
        if (action === 'download') { btn.disabled = true; await download(id); btn.disabled = false; return; }
        if (action === 'retry') {
          if (r.status !== 'failed') return;
          patientFor(r.patientId, true);
          r.status = 'generating'; r.startedAt = Date.now(); r.readyAt = r.startedAt + 15000;
          r.completedAt = null; r.failureReason = ''; r.pages = []; r.attempt += 1;
          S.saveSlide(r); notify(); A.toast('已重新开始生成', 'success');
        }
        if (action === 'delete') {
          btn.disabled = true;
          var confirmed = await A.confirmModal({ title: '删除幻灯生成记录', body: '删除后无法恢复，确定删除“' + r.title + '”及其幻灯吗？', confirmText: '删除', danger: true });
          if (confirmed) { r = recordFor(id); if (r.status === 'generating') throw new Error('生成中的记录暂不可删除'); S.deleteSlide(id); notify(); A.toast('幻灯生成记录已删除', 'success'); }
          btn.disabled = false;
        }
      } catch (err) { btn.disabled = false; report(err); }
    });
    listeners.push(render); render(); reconcile();
    if (!timer) timer = setInterval(function () { if (!document.hidden) reconcile(); }, 1000);
  }
  window.addEventListener('storage', function (e) {
    if (e.key === 'hrimdt_slides_v1' || e.key === 'hrimdt_session' || e.key === 'hrimdt_patients' || e.key === null) {
      if (activeOverlay) activeOverlay.close();
      notify(); reconcile();
    }
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { notify(); reconcile(); } });
  window.addEventListener('pagehide', function () { clearInterval(timer); timer = null; });
  window.addEventListener('pageshow', function () { if (listeners.length && !timer) timer = setInterval(reconcile, 1000); reconcile(); });
  return { mount: mount, openGenerate: openGenerate, download: download, preview: preview };
})();
