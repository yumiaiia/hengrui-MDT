/* 恒瑞IMDT 演示数据（seed）——文案取自 UI 设计图原文 */
window.HR_SEED = (function () {
  var DISCLAIMER = '内容仅供医生参考，最终方案以临床评估为准';

  var users = [
    { id: 'u_002', phone: '13900000002', name: '李明华', hospital: 'XX省肿瘤医院', department: '肿瘤内科', createdAt: '2026-08-15 10:20', lastLoginAt: '2026-09-22 09:12' },
    { id: 'u_003', phone: '13900000003', name: '王志强', hospital: 'XX市中心医院', department: '呼吸内科', createdAt: '2026-08-20 14:30', lastLoginAt: '2026-09-21 16:40' }
  ];

  /* CASE016 —— 移动端结果页数据（UI 图原文） */
  var zhangXiansheng = {
    id: 'p_001',
    code: 'CASE016-20260923',
    gender: '男', age: 61,
    disease: '非小细胞肺癌',
    creatorId: 'u_002', creatorName: '李明华',
    status: 'completed', progressStep: 4,
    materials: [
      { type: '门诊病历', name: '门诊病历.pdf', source: 'file', size: '2.4 MB', uploadedAt: '2026-09-23 09:41' },
      { type: '检查报告', name: '检查报告.jpg', source: 'camera', size: '1.8 MB', uploadedAt: '2026-09-23 09:43' }
    ],
    createdAt: '2026-09-23 09:45', updatedAt: '2026-09-23 09:52', isSample: false,
    timeline: [
      { date: '2026-09-23', tag: '诊疗记录', title: '提交MDT分析', desc: '上传门诊病历、检查报告等材料，提交MDT多学科综合分析。' },
      { date: '2026-09-18', tag: '检验', title: '初诊检查完善', desc: '完善影像与病理相关检查，明确非小细胞肺癌诊断，评估分期资料。' },
      { date: '2026-09-12', tag: '门诊病历', title: '首诊建档', desc: '门诊就诊，建立患者档案，汇总既往病史与检查资料。' }
    ],
    result: {
      overall: '综合现有材料，建议完善分期与相关评估，由多学科共同讨论后续诊疗方案。',
      keyPoints: [{ k: '完善评估' }, { k: '多学科讨论' }, { k: '关注合并症' }],
      departments: [
        { name: '心内科', summary: '结合心血管病史，完善心功能及相关风险评估。', points: [{ label: '评估要点', text: '结合心血管病史与现有检查，评估心功能状态。' }, { label: '建议事项', text: '完善心功能评估，结合既往病史讨论后续监测安排。' }] },
        { name: '肾病科', summary: '关注肾功能变化，结合检查结果评估后续方案。', points: [{ label: '评估要点', text: '关注肾功能变化，结合检查结果评估基线。' }, { label: '建议事项', text: '结合检查结果评估后续方案与复查频率。' }] },
        { name: '肿瘤科', summary: '结合病理、分期与分子检测结果，讨论治疗路径。', points: [{ label: '评估要点', text: '结合病理、分期与分子检测结果，综合评估治疗路径。' }, { label: '建议事项', text: '讨论后续治疗路径，完善分期与分子检测资料。' }] },
        { name: '影像科', summary: '对比既往影像，评估病灶范围与动态变化。', points: [{ label: '评估要点', text: '汇总既往影像结论，核对病灶范围与变化情况。' }, { label: '建议事项', text: '对比前后检查，补充必要的影像评估意见。' }] }
      ],
      disclaimer: DISCLAIMER
    },
    systems: [
      { system: '肺与呼吸', note: '结合症状评估呼吸状态', metrics: [{ name: '静息SpO₂', value: '96', unit: '%', trend: 'flat' }] },
      { system: '血液系统', note: '关注治疗期间血象变化', metrics: [{ name: '血红蛋白', value: '115', unit: 'g/L', trend: 'down' }, { name: '白细胞', value: '6.2', unit: '×10⁹/L', trend: 'flat' }] },
      { system: '电解质', note: '结合复查结果判断变化', metrics: [{ name: '血钾', value: '3.8', unit: 'mmol/L', trend: 'flat' }, { name: '血钠', value: '138', unit: 'mmol/L', trend: 'flat' }] }
    ]
  };

  /* P20260812036 —— Web 患者详情三 Tab 数据（UI 图原文） */
  var zhangMingyuan = {
    id: 'p_002',
    code: 'P20260812036',
    gender: '男', age: 62,
    disease: '肺腺癌•IV期',
    creatorId: 'u_003', creatorName: '王志强',
    status: 'completed', progressStep: 4,
    materials: [
      { type: '病理', name: '病理诊断报告.pdf', source: 'file', size: '3.1 MB', uploadedAt: '2026-08-12 18:02' },
      { type: '检查报告', name: '胸部CT报告.pdf', source: 'file', size: '2.7 MB', uploadedAt: '2026-08-12 18:05' },
      { type: '检验报告', name: '实验室检验报告.pdf', source: 'file', size: '1.9 MB', uploadedAt: '2026-08-12 18:07' },
      { type: '出入院小结', name: '出入院小结.pdf', source: 'file', size: '2.2 MB', uploadedAt: '2026-08-12 18:09' },
      { type: '门诊病历', name: '门诊病历.pdf', source: 'file', size: '1.6 MB', uploadedAt: '2026-08-12 18:10' },
      { type: '检查报告', name: '心电图报告.jpg', source: 'camera', size: '0.9 MB', uploadedAt: '2026-08-12 18:12' }
    ],
    createdAt: '2026-08-12 18:14', updatedAt: '2026-09-18 16:40', isSample: true,
    timeline: [
      { date: '2026-09-18', tag: '复诊记录', title: '复诊与多学科评估', desc: '近期活动后气促、乏力。心肾相关指标出现异常，拟提交MDT综合评估。ECOG评分1分；继续补充专科评估资料。' },
      { date: '2026-09-05', tag: '检验', title: '实验室复查', desc: '肌酐132μmol/L，eGFR 49mL/min/1.73m²；血红蛋白106g/L。记录肾功能与血液学指标变化。' },
      { date: '2026-08-22', tag: '随访', title: '治疗后随访', desc: '已完成首周期系统治疗。出现轻度乏力，日常生活基本不受影响。随访记录已归档，待结合后续检查综合评价。' },
      { date: '2026-08-15', tag: '诊疗记录', title: '治疗方案讨论', desc: '结合病理结果、分期及合并症情况，讨论系统治疗方案。既往高血压病史8年，持续记录血压与用药情况。' },
      { date: '2026-08-12', tag: '病理', title: '病理诊断确认', desc: '病理提示肺腺癌，临床分期IV期；分子检测资料已送检。建立患者档案，汇总既往病史与检查资料。' }
    ],
    result: {
      overall: '当前需同时关注肿瘤治疗评估、心功能变化及肾功能下降。建议补充相关检查，由多学科共同评估后续诊疗方案与随访安排。',
      keyPoints: [
        { k: '待完善', sub: '专科评估及检查资料' },
        { k: '重点关注', sub: '心肾功能与治疗耐受性' },
        { k: '协同安排', sub: '复查后综合讨论' }
      ],
      departments: [
        { name: '心内科', summary: 'NT-proBNP升高、LVEF降低，结合活动后气促评估心功能。', points: [{ label: '评估要点', text: 'NT-proBNP 升高、LVEF 降低，结合活动后气促评估心功能。' }, { label: '建议事项', text: '完善心电图及心脏超声复核，结合既往病史讨论后续监测安排。' }] },
        { name: '肾病科', summary: '肌酐升高、eGFR下降，需结合既往基线判断变化。', points: [{ label: '评估要点', text: '肌酐升高、eGFR 下降，需结合既往基线判断变化。' }, { label: '建议事项', text: '复核肾功能与电解质，评估相关用药及后续复查频率。' }] },
        { name: '肿瘤科', summary: '结合病理、分子检测及治疗记录，综合判断治疗耐受性。', points: [{ label: '评估要点', text: '结合病理、分子检测及治疗记录，综合判断治疗耐受性。' }, { label: '建议事项', text: '在心肾功能评估基础上，讨论后续治疗及随访计划。' }] },
        { name: '影像科', summary: '汇总既往影像结论，核对病灶范围与变化情况。', points: [{ label: '评估要点', text: '汇总既往影像结论，核对病灶范围与变化情况。' }, { label: '建议事项', text: '统一前后检查对比口径，补充必要的影像评估意见。' }] }
      ],
      disclaimer: DISCLAIMER
    },
    systems: [
      { system: '肝脏与营养', note: '结合营养状态综合评估', metrics: [{ name: '白蛋白', value: '33', unit: 'g/L', trend: 'down' }, { name: 'ALT', value: '58', unit: 'U/L', trend: 'up' }] },
      { system: '血液系统', note: '关注治疗期间血象变化', metrics: [{ name: '血红蛋白', value: '106', unit: 'g/L', trend: 'down' }, { name: '血小板', value: '118', unit: '×10⁹/L', trend: 'flat' }] },
      { system: '肺与呼吸', note: '结合症状评估呼吸状态', metrics: [{ name: '静息SpO₂', value: '93', unit: '%', trend: 'down' }, { name: '活动后气促', value: 'Ⅱ级', unit: '', trend: 'up' }] },
      { system: '心血管系统', note: '关注心功能变化', metrics: [{ name: 'NT-proBNP', value: '680', unit: 'pg/mL', trend: 'up' }, { name: 'LVEF', value: '48', unit: '%', trend: 'flat' }] },
      { system: '肾脏功能', note: '关注肾功能与用药评估', metrics: [{ name: '肌酐', value: '132', unit: 'μmol/L', trend: 'up' }, { name: 'eGFR', value: '49', unit: 'mL/min/1.73m²', trend: 'down' }] },
      { system: '电解质', note: '结合复查结果判断变化', metrics: [{ name: '血钾', value: '3.3', unit: 'mmol/L', trend: 'down' }, { name: '血钠', value: '133', unit: 'mmol/L', trend: 'flat' }] }
    ]
  };

  /* P20260908012 —— 分析中（演示进度续跑） */
  var chenYaqin = {
    id: 'p_003',
    code: 'P20260908012',
    gender: '女', age: 54,
    disease: '乳腺癌•II期',
    creatorId: 'u_003', creatorName: '王志强',
    status: 'analyzing', progressStep: 2,
    materials: [
      { type: '门诊病历', name: '门诊病历.pdf', source: 'file', size: '1.4 MB', uploadedAt: '2026-09-08 15:02' },
      { type: '检验报告', name: '检验报告.pdf', source: 'file', size: '2.1 MB', uploadedAt: '2026-09-08 15:05' },
      { type: '检查报告', name: '乳腺超声报告.jpg', source: 'camera', size: '1.2 MB', uploadedAt: '2026-09-08 15:07' }
    ],
    createdAt: '2026-09-08 15:10', updatedAt: '2026-09-08 15:10', isSample: false,
    timeline: [
      { date: '2026-09-08', tag: '诊疗记录', title: '提交MDT分析', desc: '上传门诊病历、检验与检查报告等材料，提交MDT多学科综合分析。' }
    ],
    result: null,
    systems: []
  };

  return {
    users: users,
    patients: [zhangXiansheng, zhangMingyuan, chenYaqin],
    meta: { seq: 12 },
    constants: {
      diseases: ['非小细胞肺癌', '小细胞肺癌', '肺腺癌', '乳腺癌', '结直肠癌', '胃癌', '肝癌', '食管癌', '宫颈癌', '淋巴瘤', '前列腺癌', '其他'],
      departments: ['肿瘤内科', '呼吸内科', '心内科', '肾病科', '影像科', '外科', '放疗科', '其他'],
      materialTypes: ['门诊病历', '检查报告', '检验报告', '出入院小结'],
      consentTitle: '患者知情同意书',
      consentText: [
        '尊敬的医生：',
        '在提交患者材料进行MDT（多学科诊疗）分析前，请仔细阅读以下内容：',
        '1. 材料用途：本次上传的患者资料将仅用于本次MDT分析与诊疗建议生成，分析完成后系统不会将材料用于其他用途。',
        '2. 隐私保护：系统将对材料中的姓名、身份证号、联系方式等隐私信息进行自动脱敏处理，材料全程加密存储与传输。',
        '3. 医生责任：请您确认已获得患者或其监护人对本次分析及资料使用的知情同意。',
        '4. 结果性质：MDT分析结果仅供医生参考，最终诊疗方案以临床综合评估为准。',
        '勾选"我已阅读并同意"即表示您已阅读并同意上述全部条款。'
      ]
    }
  };
})();
