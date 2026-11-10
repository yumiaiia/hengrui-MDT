/* 恒瑞IMDT 数据层（localStorage） */
window.HRStore = (function () {
  var K_USERS = 'hrimdt_users';
  var K_PATIENTS = 'hrimdt_patients';
  var K_SESSION = 'hrimdt_session';
  var K_META = 'hrimdt_meta';

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function init() {
    if (localStorage.getItem(K_USERS) === null) write(K_USERS, window.HR_SEED.users);
    if (localStorage.getItem(K_PATIENTS) === null) write(K_PATIENTS, window.HR_SEED.patients);
    if (localStorage.getItem(K_META) === null) write(K_META, window.HR_SEED.meta);
  }
  function resetAll() {
    [K_USERS, K_PATIENTS, K_SESSION, K_META].forEach(function (k) { localStorage.removeItem(k); });
    init();
  }

  /* ---------- 用户 ---------- */
  function listUsers() { return read(K_USERS, []); }
  function findUserByPhone(phone) {
    return listUsers().filter(function (u) { return u.phone === phone; })[0] || null;
  }
  function findUserById(id) {
    return listUsers().filter(function (u) { return u.id === id; })[0] || null;
  }
  function nextUserId() { return 'u_' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 90 + 10); }
  function createUser(data) {
    var users = listUsers();
    var user = {
      id: nextUserId(),
      phone: data.phone,
      name: data.name,
      hospital: data.hospital || '',
      department: data.department || '',
      createdAt: nowStr(),
      lastLoginAt: ''
    };
    users.push(user);
    write(K_USERS, users);
    return user;
  }
  function updateUser(id, patch) {
    var users = listUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        for (var k in patch) users[i][k] = patch[k];
        write(K_USERS, users);
        return users[i];
      }
    }
    return null;
  }
  function touchLogin(id) { updateUser(id, { lastLoginAt: nowStr() }); }

  /* ---------- 患者 ---------- */
  function listPatients() { return read(K_PATIENTS, []); }
  function getPatientById(id) {
    return listPatients().filter(function (p) { return p.id === id; })[0] || null;
  }
  function listPatientsByCreator(userId) {
    return listPatients().filter(function (p) { return p.creatorId === userId; });
  }
  function updatePatient(id, patch) {
    var patients = listPatients();
    for (var i = 0; i < patients.length; i++) {
      if (patients[i].id === id) {
        for (var k in patch) patients[i][k] = patch[k];
        patients[i].updatedAt = nowStr();
        write(K_PATIENTS, patients);
        return patients[i];
      }
    }
    return null;
  }
  function nextCode() {
    var meta = read(K_META, { seq: 1 });
    meta.seq += 1;
    write(K_META, meta);
    var d = new Date();
    var ymd = '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    return 'P' + ymd + String(meta.seq).padStart(2, '0');
  }
  function createPatient(data) {
    var patients = listPatients();
    var patient = {
      id: 'p_' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 90 + 10),
      code: nextCode(),
      gender: data.gender || '',
      age: data.age || null,
      disease: data.disease,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      status: 'analyzing',
      progressStep: 2,
      materials: data.materials || [],
      createdAt: nowStr(),
      updatedAt: nowStr(),
      isSample: false,
      timeline: [{ date: todayStr(), tag: '诊疗记录', title: '提交MDT分析', desc: '上传' + (data.materials || []).length + '份材料，提交MDT多学科综合分析。' }],
      result: null,
      systems: []
    };
    patients.unshift(patient);
    write(K_PATIENTS, patients);
    return patient;
  }
  function advanceProgress(id) {
    var p = getPatientById(id);
    if (!p || p.status === 'completed') return p;
    var step = Math.min(4, p.progressStep + 1);
    var patch = { progressStep: step };
    if (step >= 4) {
      patch.status = 'completed';
      patch.result = generateResult(p);
    }
    return updatePatient(id, patch);
  }
  function statsByCreator(userId) {
    var list = listPatientsByCreator(userId);
    return {
      total: list.length,
      analyzing: list.filter(function (p) { return p.status === 'analyzing'; }).length,
      completed: list.filter(function (p) { return p.status === 'completed'; }).length
    };
  }

  /* ---------- 会话 ---------- */
  function getSession() { return read(K_SESSION, null); }
  function setSession(user) {
    write(K_SESSION, { userId: user.id, name: user.name, phone: user.phone, loginAt: new Date().toISOString() });
  }
  function clearSession() { localStorage.removeItem(K_SESSION); }

  /* ---------- 工具 ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function nowStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function generateResult(p) {
    return {
      overall: '综合现有材料，建议围绕' + p.disease + '完善分期与相关评估，由多学科共同讨论后续诊疗方案。',
      keyPoints: [{ k: '完善评估' }, { k: '多学科讨论' }, { k: '关注合并症' }],
      departments: [
        { name: '心内科', summary: '结合心血管病史，完善心功能及相关风险评估。', points: [{ label: '评估要点', text: '结合心血管病史与现有检查，评估心功能状态。' }, { label: '建议事项', text: '完善心功能评估，结合既往病史讨论后续监测安排。' }] },
        { name: '肾病科', summary: '关注肾功能变化，结合检查结果评估后续方案。', points: [{ label: '评估要点', text: '关注肾功能变化，结合检查结果评估基线。' }, { label: '建议事项', text: '结合检查结果评估后续方案与复查频率。' }] },
        { name: '肿瘤科', summary: '结合病理、分期与分子检测结果，讨论治疗路径。', points: [{ label: '评估要点', text: '结合病理、分期与分子检测结果，综合评估治疗路径。' }, { label: '建议事项', text: '讨论后续治疗路径，完善分期与分子检测资料。' }] },
        { name: '影像科', summary: '对比既往影像，评估病灶范围与动态变化。', points: [{ label: '评估要点', text: '汇总既往影像结论，核对病灶范围与变化情况。' }, { label: '建议事项', text: '对比前后检查，补充必要的影像评估意见。' }] }
      ],
      disclaimer: '内容仅供医生参考，最终方案以临床评估为准'
    };
  }

  init();

  return {
    init: init, resetAll: resetAll,
    listUsers: listUsers, findUserByPhone: findUserByPhone, findUserById: findUserById,
    createUser: createUser, updateUser: updateUser, touchLogin: touchLogin,
    listPatients: listPatients, getPatientById: getPatientById, listPatientsByCreator: listPatientsByCreator,
    updatePatient: updatePatient, createPatient: createPatient, advanceProgress: advanceProgress,
    statsByCreator: statsByCreator, generateResult: generateResult,
    getSession: getSession, setSession: setSession, clearSession: clearSession,
    nowStr: nowStr, todayStr: todayStr
  };
})();
