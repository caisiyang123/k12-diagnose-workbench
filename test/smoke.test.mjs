import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readJSON(name) {
  return JSON.parse(readFileSync(resolve(root, name), 'utf8'));
}

// 用 CommonJS shim 加载 UMD 引擎（原站 diagnose/engine.js）
function loadEngine() {
  const source = readFileSync(resolve(root, 'site/diagnose/engine.js'), 'utf8');
  const moduleShim = { exports: {} };
  const fn = new Function('module', 'exports', 'self', source);
  fn(moduleShim, moduleShim.exports, undefined);
  if (!moduleShim.exports || typeof moduleShim.exports.buildGraph !== 'function') {
    throw new Error('engine UMD did not expose buildGraph');
  }
  return moduleShim.exports;
}

test('原站 data 文件有效且非空', () => {
  const topics = readJSON('site/data/topics.json');
  const deps = readJSON('site/data/dependencies.json');
  const questions = readJSON('site/data/questions.json');
  const standards = readJSON('site/data/cn-curriculum-standards.json');
  const aliases = readJSON('site/data/id-aliases.json');
  assert.ok(Array.isArray(topics) && topics.length > 0, 'topics 非空');
  assert.ok(Array.isArray(deps), 'dependencies 是数组');
  assert.ok(Array.isArray(questions) && questions.length > 0, 'questions 非空');
  assert.ok(standards && Array.isArray(standards.items) && standards.items.length > 0, 'standards.items 非空');
  assert.equal(typeof aliases, 'object');
});

test('原站引擎在真实数据上跑通诊断', () => {
  const E = loadEngine();
  const topics = readJSON('site/data/topics.json');
  const deps = readJSON('site/data/dependencies.json');
  const questions = readJSON('site/data/questions.json');
  const graph = E.buildGraph(topics, deps, questions);
  assert.ok(graph.byId['cnm_221'], '配方法知识点存在');

  const scope = E.gradeTargets(graph, '八上', 'math');
  assert.ok(scope && scope.ids.length > 0, '八上数学有知识点');

  let s = E.createSession(graph, ['cnm_221'], { limit: 16, seed: 'test' });
  const item = E.nextItem(graph, s);
  assert.ok(item && item.topicId === 'cnm_221', '首问目标知识点');
  s = E.applyAnswer(graph, s, item.topicId, 'wrong', { text: 'x' });
  const sum = E.summarize(graph, s);
  assert.ok(sum && Array.isArray(sum.path), 'summarize 返回学习路径');
});

test('原站页面与静态资源已打包', () => {
  for (const f of ['site/index.html', 'site/explore/index.html', 'site/explore/app.js', 'site/diagnose/index.html', 'site/diagnose/app.js', 'site/diagnose/engine.js', 'site/children/index.html', 'site/children/page.js', 'site/assets/site.css', 'site/assets/vendor/cytoscape.min.js', 'site/assets/vendor/dagre.min.js', 'site/assets/vendor/cytoscape-dagre.js', 'site/assets/vendor/qrcode.js', 'site/sw.js', 'site/manifest.webmanifest']) {
    assert.ok(existsSync(resolve(root, f)), `缺少 ${f}`);
  }
});

test('package manifest and patch are well-formed', () => {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'dsh-k12-diagnose-workbench');
  assert.equal(pkg.main, 'dsh/index.js');
  assert.equal(pkg.exports['.'], './dsh/index.js');
  assert.equal(pkg.exports['./client'], './lib/client.js');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(pkg.dsh.client.platform, 'web');
  assert.ok(pkg.dsh.client.inject.includes('dsh-desktop-workbenches'));
  assert.ok(pkg.files.includes('site'), 'files 包含 site');

  const patch = readFileSync(resolve(root, 'cordis.patch.yml'), 'utf8');
  assert.ok(patch.includes('id: k12-diagnose-workbench'), 'patch 含插件 id');
  assert.ok(patch.includes('name: dsh-k12-diagnose-workbench'), 'patch 的 name 是包名');
});

test('built client.js 注册工作台且用 iframe 嵌入原站', () => {
  const file = resolve(root, 'lib/client.js');
  assert.ok(existsSync(file), 'lib/client.js 已构建');
  const src = readFileSync(file, 'utf8');
  assert.ok(src.includes('window.__ModuleLoader__.load'), '有模块加载器包裹');
  assert.ok(src.includes("id: 'dsh-k12-diagnose-workbench'"), '模块 id 与包名一致');
  assert.ok(src.includes('desktopWorkbenches.register'), '注册工作台面板');
  assert.ok(src.includes('customFrame: true'), '使用 customFrame 布局');
  assert.ok(src.includes("role: 'separator'"), '有可拖拽分隔条');
  assert.ok(src.includes('iframe'), '用 iframe 嵌入');
  assert.ok(src.includes('/k12-site/'), 'iframe 指向原站（裸 webServer 路由）');
  assert.ok(src.includes('加载失败'), '有可见的加载失败横幅');
});

test('服务端用裸 webServer 注册路由（允许尾斜杠，不走 /api 校验）', () => {
  const src = readFileSync(resolve(root, 'dsh/index.js'), 'utf8');
  assert.ok(src.includes("ctx.inject(['webServer']"), '通过 ctx.inject 获取 webServer');
  assert.ok(src.includes("kind: 'exact'"), '用 exact 精确路由');
  assert.ok(!src.includes('connection.fetch.register'), '不再用 connection.fetch（其校验拒绝尾斜杠路径）');
  assert.ok(src.includes('/k12-site'), '路由前缀为 /k12-site');
});

test('client panel 在空状态下渲染不抛错', () => {
  const src = readFileSync(resolve(root, 'lib/client.js'), 'utf8');
  const sandbox = {};
  sandbox.self = sandbox;
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.console = console;
  sandbox.document = {
    createElement: () => ({ setAttribute() {}, remove() {}, textContent: '' }),
    head: { appendChild() {} }
  };
  let captured = null;
  sandbox.__ModuleLoader__ = { load: (spec) => { captured = spec; } };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'client.js' });
  assert.ok(captured, '__ModuleLoader__.load 被调用');

  const React = {
    createElement: () => ({}),
    useState: (init) => [init, () => {}],
    useEffect: () => {},
    useRef: () => ({ current: null })
  };
  const { apply } = captured.factory((name) => (name === 'react' ? React : undefined));
  let panel = null;
  const ctx = { effect: (fn) => fn(), desktopWorkbenches: { register: (_meta, Panel) => { panel = Panel; } } };
  apply(ctx);
  assert.equal(typeof panel, 'function', 'register 提供了 Panel');

  const service = { currentSession: () => null, getSnapshot: () => ({ state: { sessionBindings: {} } }) };
  assert.doesNotThrow(() => panel({ service, entry: { id: 'x' }, conversation: null }),
    'Panel 空状态渲染不抛错');
});
