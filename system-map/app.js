(function (global) {
  'use strict';

  var STATUS_TEXT = {
    done: '已做',
    partial: '部分',
    todo: '未做',
  };

  var LAYER_TEXT = {
    core: '通用核心（战场工具）',
    pending: '待接入（会互相牵扯）',
    content: '长征内容',
  };

  var modules = {
    'level-format': {
      name: '关卡格式',
      file: 'red-ribbon-battlefield-v0',
      status: 'done',
      layer: 'core',
      what: '编辑器与试玩共用的关卡 JSON 契约；改默认关改 levels/，不是两套布局。',
      deps: '被 level-core.js、编辑器、试玩壳读写。',
      note: '已落地；本页按 brief 2026-11-21 快照标注。',
    },
    'battlefield-editor': {
      name: '战场编辑器',
      file: '编辑模式（第 1–3 层）',
      status: 'done',
      layer: 'core',
      what: '单位摆放、存档、试玩；工事；缓丘图章、铁丝网/战壕拉线、存为 Demo。',
      deps: '写 level-core；与试玩共用关卡 JSON。',
      note: '第 1–3 层已可本地用。',
    },
    'unit-core': {
      name: '单位状态',
      file: 'unit-core.js',
      status: 'partial',
      layer: 'core',
      what: '单位通用字段与存活/生命等基础状态。',
      deps: '被 combat、视线、目标结算、将来士气规则使用。',
      note: 'id / side / alive / hp / morale / ammo / tags 已挂；姓名 / 性格 / 羁绊 / storySeed 未挂。',
    },
    'combat-core': {
      name: '射击与伤害',
      file: 'combat-core.js',
      status: 'done',
      layer: 'core',
      what: '开枪、占位伤害与弹药消耗。',
      deps: '依赖 unit-core、视线、工事挡视。',
      note: '已接入开火；士气/侧翼加成尚未接。',
    },
    los: {
      name: '视野 / 视线',
      file: '开枪挡视逻辑',
      status: 'done',
      layer: 'core',
      what: '地形与工事挡视，决定能否开枪。',
      deps: '工事/地形数据；被 combat 调用。',
      note: '视线已接入开枪。',
    },
    'prop-collision': {
      name: '工事与碰撞',
      file: 'prop-collision.js',
      status: 'done',
      layer: 'core',
      what: '工事挡路挡视；种类契约在关卡数据里。',
      deps: '关卡 JSON 种类；编辑器摆放与试玩同一套。',
      note: '已落地。',
    },
    terrain: {
      name: '地形（缓丘 / 战壕）',
      file: 'level-core.js stamps / 战壕',
      status: 'done',
      layer: 'core',
      what: '缓丘图章、战壕拉线与地形取样。',
      deps: 'level-core；编辑器写、试玩读。',
      note: '已落地。',
    },
    'goal-core': {
      name: '目标类型与结算',
      file: 'goal-core.js',
      status: 'partial',
      layer: 'core',
      what: '目标类型接口与结算；新目标类型应扩展这里。',
      deps: '被类型选择 / 试玩调用；读关卡目标字段。',
      note: '目前只实现 assault；其他类型留接口。',
    },
    'play-shell': {
      name: '类型选择与试玩壳',
      file: '选类型 → 进关',
      status: 'partial',
      layer: 'core',
      what: '先选类型再进关；默认突击关可玩。',
      deps: 'goal-core、关卡 JSON、核心交火模块。',
      note: '仅突击撕口可玩；护渡/过点、断后坚持、调开脱身等为占位。',
    },
    morale: {
      name: '士气与侧翼',
      file: '字段在 unit-core，规则未接',
      status: 'todo',
      layer: 'pending',
      what: '士气规则与侧翼加成；突击撕口尚未接士气。',
      deps: '依赖 unit-core 已有字段、交火结算；对照总纲 §6.8、士兵规则 R1–R2。',
      note: '字段已在，规则未接。不要先改编辑器地形。',
    },
    tactics: {
      name: '战术能力与代价',
      file: 'tactics-buttons-v0.md',
      status: 'todo',
      layer: 'pending',
      what: '战术键与资源代价（规划文档已有）。',
      deps: '将来挂到核心交火与单位状态；对照总纲 §6.6。',
      note: '未接到原型。',
    },
    'resource-alloc': {
      name: '行动前资源分配',
      file: 'resource-alloc-v0.md',
      status: 'todo',
      layer: 'pending',
      what: '开战前的资源分配流程。',
      deps: '依赖试玩壳与单位/弹药等字段；对照总纲 §4.2、§5。',
      note: '未接到原型。',
    },
    'other-goals': {
      name: '其余目标类型完整关',
      file: 'goal-core 接口 + 选单占位',
      status: 'todo',
      layer: 'pending',
      what: '护渡/过点、断后坚持、调开脱身等完整关；行军消耗偏行军、另标。',
      deps: '扩展 goal-core 与关卡 JSON，不按故事写死脚本。',
      note: '选单上仍是占位。',
    },
    'river-assets': {
      name: '河 / 船 / 桥等资产',
      file: '缺资产',
      status: 'todo',
      layer: 'pending',
      what: '水系相关场景资产与摆放。',
      deps: '资产到位后再进编辑器/关卡数据；不是先拆核心。',
      note: '未做。',
    },
    research: {
      name: '史料与调研',
      file: 'Research/ + 资料站',
      status: 'partial',
      layer: 'content',
      what: '武器、敌军等调研草稿；给人看的规划，不是运行时。',
      deps: '供给关卡文案与设定，不进 *-core.js。',
      note: '已有草稿，不定稿。',
    },
    stories: {
      name: '节点与故事',
      file: 'Stories/',
      status: 'partial',
      layer: 'content',
      what: '故事框架与节点；七节点待确认定稿。',
      deps: '向关卡内容、事件卡提供叙事骨架。',
      note: '进行中；不要覆盖用户已勾的「可以」。',
    },
    'level-content': {
      name: '关卡内容',
      file: 'levels/ + 内容层',
      status: 'partial',
      layer: 'content',
      what: '具体关卡布局、出生点、目标与文案。',
      deps: '复用已有目标类型与编辑器；写关卡 JSON。',
      note: '现有突击默认关是通用布局；长征专属关尚未铺开。',
    },
    characters: {
      name: '角色 / 姓名 / 性格',
      file: '士兵系统草稿',
      status: 'todo',
      layer: 'content',
      what: '战士名、性格、羁绊等表现层数据。',
      deps: '挂到角色/关卡数据，不写进 unit-core 通用规则。',
      note: '未挂到原型。',
    },
    'event-cards': {
      name: '事件卡',
      file: 'Stories/event-cards-v0.md',
      status: 'todo',
      layer: 'content',
      what: '事件卡模板与草案。',
      deps: '内容层供给；未挂运行时。',
      note: '有模板和草案，未挂原型。',
    },
    'docs-site': {
      name: '文案 / 资料站规划',
      file: '资料站若干页',
      status: 'partial',
      layer: 'content',
      what: '含「系统设计」「目标类型」等文字规划页。',
      deps: '给人看；本结构图补充位置与关系，不替换它们。',
      note: '已有若干页；不是运行时模块。',
    },
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init(root) {
    if (!root) return;
    var detail = root.querySelector('#sm-detail');
    var nodes = root.querySelectorAll('.sm-mod');
    if (!detail || !nodes.length) return;

    function renderDetail(id) {
      var m = modules[id];
      if (!m) {
        detail.innerHTML =
          '<p class="sm-detail-empty">点左侧模块，看它做什么、依赖什么、现状。</p>';
        return;
      }
      detail.innerHTML =
        '<h2>' +
        escapeHtml(m.name) +
        '</h2>' +
        '<div class="sm-detail-meta">' +
        '<span class="sm-badge ' +
        m.status +
        '">' +
        STATUS_TEXT[m.status] +
        '</span>' +
        '<span class="sm-badge layer">' +
        LAYER_TEXT[m.layer] +
        '</span>' +
        '</div>' +
        '<dl>' +
        '<dt>文件 / 位置</dt><dd><span class="sm-file">' +
        escapeHtml(m.file) +
        '</span></dd>' +
        '<dt>做什么</dt><dd>' +
        escapeHtml(m.what) +
        '</dd>' +
        '<dt>依赖 / 怎么接</dt><dd>' +
        escapeHtml(m.deps) +
        '</dd>' +
        '<dt>现状</dt><dd>' +
        escapeHtml(m.note) +
        '</dd>' +
        '</dl>';
    }

    function setActive(id) {
      nodes.forEach(function (n) {
        n.classList.toggle('active', n.getAttribute('data-id') === id);
      });
      renderDetail(id);
    }

    nodes.forEach(function (node) {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.addEventListener('click', function () {
        setActive(node.getAttribute('data-id'));
      });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActive(node.getAttribute('data-id'));
        }
      });
    });

    renderDetail(null);
  }

  global.SystemMap = { init: init };
})(typeof window !== 'undefined' ? window : this);
