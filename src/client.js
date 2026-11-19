window.__ModuleLoader__.load({
  id: 'dsh-k12-diagnose-workbench',
  factory: (require) => {
    const React = require('react');
    const { useState, useRef, useEffect } = React;
    const h = React.createElement;

    const CSS = `/* K12 知识图谱工作台 —— 原站 1:1 iframe 嵌入（kd- 前缀） */
.kd-root{--kd-bg:#f5f7f6;--kd-card:#fff;--kd-ink:#11161a;--kd-ink-2:#45505c;--kd-muted:#6b7683;
  --kd-line:#e3e8ec;--kd-line-strong:#d2d9df;--kd-accent:#0e7a5f;--kd-accent-hover:#0b6650;--kd-accent-ink:#fff;
  --kd-tint:#e7f3ef;--kd-neutral:#f0f1f3;--kd-bad:#b42318;--kd-bad-bg:#fdeaea;
  height:100%;min-height:0;display:flex;flex-direction:column;background:var(--kd-bg);color:var(--kd-ink);
  font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}
.kd-root *{box-sizing:border-box}
.kd-head{display:flex;align-items:center;gap:10px;flex:none;height:44px;padding:0 16px 0 max(16px,calc(var(--dsh-frame-leading-clearance,0px) + 10px));
  background:var(--kd-card);border-bottom:1px solid var(--kd-line)}
.kd-brand{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14px;letter-spacing:-.01em;white-space:nowrap}
.kd-logo{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--kd-tint);color:var(--kd-accent);font-size:13px}
.kd-flex{flex:1 1 auto}
.kd-btn{min-height:32px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--kd-line-strong);border-radius:8px;background:var(--kd-card);color:var(--kd-ink-2);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s}
.kd-btn:hover{border-color:var(--kd-muted);color:var(--kd-ink)}
.kd-btn:disabled{opacity:.5;cursor:not-allowed}
.kd-ghost{background:transparent;border-color:transparent;color:var(--kd-muted)}
.kd-main{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:row;overflow:hidden;container-type:inline-size}
.kd-frame{flex:1 1 auto;min-width:0;height:100%;border:0;background:#fff}
.kd-chat{flex:0 0 var(--kd-chat-width,380px);width:var(--kd-chat-width,380px);min-width:0;max-width:calc(100% - 280px);display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--kd-line);background:var(--kd-card)}
.kd-chat-head{display:flex;align-items:center;gap:8px;flex:none;padding:8px 12px;border-bottom:1px solid var(--kd-line)}
.kd-chat-title{font-size:13px;font-weight:600}
.kd-chat-empty{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;padding:24px;text-align:center;color:var(--kd-muted);font-size:13px}
.kd-chat-content{flex:1 1 0;min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column}
.kd-chat-content[hidden]{display:none}
.kd-chat-content>*{flex:1 1 0;min-height:0;min-width:0}
.kd-resizer{position:relative;flex:0 0 12px;align-self:stretch;padding:0;border:0;background:transparent;cursor:col-resize;touch-action:none;outline:none;z-index:32}
.kd-resizer::before{content:"";position:absolute;left:5px;top:0;bottom:0;width:1px;background:var(--kd-line)}
.kd-resizer-grip{position:absolute;left:2px;top:50%;width:8px;height:48px;transform:translateY(-50%);border-radius:8px;background:var(--kd-line-strong);opacity:.7}
.kd-resizer:hover,.kd-resizer:focus-visible{background:var(--kd-tint)}
.kd-resizer:hover .kd-resizer-grip,.kd-resizer:focus-visible .kd-resizer-grip{background:var(--kd-accent);opacity:1}
.kd-resizing{cursor:col-resize;user-select:none}
.kd-alert{margin:24px;padding:14px;background:var(--kd-bad-bg);color:var(--kd-bad);border:1px solid color-mix(in srgb,var(--kd-bad) 28%,transparent);border-radius:8px;font-size:13px}
[data-ds-dark-theme] .kd-root{--kd-bg:#0f1419;--kd-card:#161d24;--kd-ink:#e8edf3;--kd-ink-2:#a7b1bd;--kd-muted:#7f8b98;--kd-line:#29333d;--kd-line-strong:#3a4550;--kd-accent:#5fd3a0;--kd-accent-hover:#78dcaf;--kd-accent-ink:#0e1220;--kd-tint:#1b3529;--kd-neutral:#232b33;--kd-bad:#ff938a;--kd-bad-bg:#3a2422}
@media (prefers-reduced-motion:reduce){.kd-root *{transition:none!important}}`;

    const CHAT_WIDTH_MIN = 320, CHAT_WIDTH_MAX = 720, CHAT_WIDTH_DEFAULT = 380;
    const LAYOUT_KEY = 'k12-diagnose-layout-v1';
    const SITE_URL = '/k12-site/';

    function clampChatWidth(value, containerWidth) {
      const max = Math.min(CHAT_WIDTH_MAX, Math.max(CHAT_WIDTH_MIN, containerWidth - 280));
      const min = Math.min(CHAT_WIDTH_MIN, max);
      return Math.max(min, Math.min(max, Math.round(value)));
    }
    function loadChatWidth() { try { const n = parseInt(localStorage.getItem(LAYOUT_KEY) || '', 10); return Number.isFinite(n) ? n : CHAT_WIDTH_DEFAULT; } catch { return CHAT_WIDTH_DEFAULT; } }
    function saveChatWidth(v) { try { localStorage.setItem(LAYOUT_KEY, String(v)); } catch {} }

    function Panel({ service, entry, conversation } = {}) {
      const [chatOpen, setChatOpen] = useState(false);
      const [chatWidth, setChatWidth] = useState(loadChatWidth);
      const [resizing, setResizing] = useState(false);
      const [chatStarting, setChatStarting] = useState(false);
      const [error, setError] = useState('');
      const [siteState, setSiteState] = useState('checking'); // checking | ready | failed
      const [siteErr, setSiteErr] = useState('');
      const mainRef = useRef(null);
      const chatWidthRef = useRef(chatWidth);

      // 探测原站路由是否可用：失败时显示可见横幅而不是白屏
      useEffect(() => {
        let cancelled = false;
        (async () => {
          try {
            const r = await fetch(SITE_URL, { credentials: 'same-origin' });
            const ct = r.headers.get('content-type') || '';
            if (cancelled) return;
            if (r.ok && ct.includes('text/html')) setSiteState('ready');
            else { setSiteState('failed'); setSiteErr(`站点路由返回 HTTP ${r.status}（${ct || '无内容类型'}）。请完整退出并重开 DSH Desktop 后重试。`); }
          } catch (e) {
            if (!cancelled) { setSiteState('failed'); setSiteErr(`站点路由无法访问：${e && e.message ? e.message : String(e)}。请完整退出并重开 DSH Desktop 后重试。`); }
          }
        })();
        return () => { cancelled = true; };
      }, []);

      const sid = service && service.currentSession ? service.currentSession() : null;
      const host = service && service.getSnapshot ? service.getSnapshot() : null;
      const owned = sid && host && host.state && host.state.sessionBindings && host.state.sessionBindings[sid] === (entry && entry.id) ? sid : null;

      function updateChatWidth(value, persist = false) {
        const cw = mainRef.current ? mainRef.current.getBoundingClientRect().width : 1280;
        const next = clampChatWidth(value, cw);
        chatWidthRef.current = next; setChatWidth(next);
        if (persist) saveChatWidth(next);
      }
      function startChatResize(event) {
        if (event.button != null && event.button !== 0) return;
        event.preventDefault();
        const handle = event.currentTarget; const startX = event.clientX; const startWidth = chatWidthRef.current;
        setResizing(true);
        try { handle.setPointerCapture(event.pointerId); } catch {}
        const move = (mv) => updateChatWidth(startWidth + startX - mv.clientX);
        const finish = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', finish); handle.removeEventListener('pointercancel', finish); setResizing(false); saveChatWidth(chatWidthRef.current); };
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', finish); handle.addEventListener('pointercancel', finish);
      }
      function resizeWithKeyboard(event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') return updateChatWidth(CHAT_WIDTH_DEFAULT, true);
        updateChatWidth(chatWidthRef.current + (event.key === 'ArrowLeft' ? 16 : -16), true);
      }

      async function startConversation() {
        setChatOpen(true); setError(''); setChatStarting(true);
        try {
          if (owned) return owned;
          if (!hostCtx.uiWorkspace || !hostCtx.uiWorkspace.pickDirectory) throw new Error('当前宿主未提供目录选择器');
          const folder = await hostCtx.uiWorkspace.pickDirectory();
          if (!folder) return null;
          const target = await hostCtx.desktopWorkbenches.ensureSession({ folder });
          if (target && !hostCtx.desktopWorkbenches.ownsSession(target)) throw new Error('创建的会话不属于当前工作台');
          return target || null;
        } catch (e) { setError(e.message || '无法打开工作台会话'); return null; } finally { setChatStarting(false); }
      }
      async function openChat() {
        setChatOpen(true); setError('');
        try {
          const target = owned || await startConversation();
          if (!target) return;
          if (!hostCtx.desktopWorkbenches.ownsSession(target)) throw new Error('请先打开当前工作台会话');
          if (hostCtx.uiSession && hostCtx.uiSession.current) {
            const source = hostCtx.uiSession.current.getSnapshot();
            const actions = source && source.props && source.props.inputActions;
            if (actions && actions.setDraft) {
              const cur = (source.hooks && source.hooks.input && source.hooks.input.getSnapshot() && source.hooks.input.getSnapshot().draft) || '';
              actions.setDraft(cur ? `${cur}\n\n请结合中小学知识图谱，帮我分析当前页面内容并给出学习建议。` : '请结合中小学知识图谱，帮我分析当前页面内容并给出学习建议。');
            }
          }
        } catch (e) { setError(e.message || '无法写入会话草稿'); }
      }

      try {
        const chatColumn = conversation ? h('div', { className: 'kd-chat' },
          h('div', { className: 'kd-chat-head' }, h('span', { className: 'kd-chat-title' }, 'AI 讲解'), h('span', { className: 'kd-flex' }), h('button', { className: 'kd-ghost kd-btn', onClick: () => setChatOpen(false), 'aria-label': '关闭对话' }, '×')),
          h('div', { className: 'kd-chat-content', hidden: !owned }, conversation)) : null;

        return h('div', { className: 'kd-root' + (resizing ? ' kd-resizing' : ''), style: { '--kd-chat-width': `${chatWidth}px` } },
          h('header', { className: 'kd-head' },
            h('div', { className: 'kd-brand' }, h('span', { className: 'kd-logo' }, '知'), h('span', null, '中小学·高中知识图谱')),
            h('span', { className: 'kd-flex' }),
            h('button', { className: 'kd-btn', disabled: chatStarting, onClick: () => { chatOpen ? setChatOpen(false) : openChat(); } }, chatOpen ? '收起对话' : '让 AI 分析 ↗')),
          error && h('div', { className: 'kd-alert', style: { margin: '8px 16px' } }, error),
          h('div', { className: 'kd-main', ref: mainRef },
            siteState === 'failed'
              ? h('div', { className: 'kd-alert', style: { margin: 24, flex: '1 1 auto' } },
                  h('h2', { style: { margin: '0 0 8px' } }, '原站页面加载失败'),
                  h('p', { style: { margin: 0 } }, siteErr),
                  h('p', { style: { margin: '8px 0 0', opacity: .8 } }, `探测地址：${SITE_URL}`))
              : h('iframe', {
                  className: 'kd-frame', src: SITE_URL, title: '中小学·高中知识图谱',
                  sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads',
                  style: siteState === 'checking' ? { visibility: 'hidden' } : undefined,
                  onLoad: () => setSiteState((s) => s === 'checking' ? 'ready' : s),
                  onError: () => { setSiteState('failed'); setSiteErr('iframe 加载出错。'); }
                }),
            chatOpen && h('button', { className: 'kd-resizer', role: 'separator', tabIndex: 0, 'aria-label': '调整工作台与对话宽度', 'aria-orientation': 'vertical', 'aria-valuemin': CHAT_WIDTH_MIN, 'aria-valuemax': CHAT_WIDTH_MAX, 'aria-valuenow': chatWidth, title: '拖动调整两侧宽度；方向键微调，Home 恢复默认', onPointerDown: startChatResize, onKeyDown: resizeWithKeyboard, onDoubleClick: () => updateChatWidth(CHAT_WIDTH_DEFAULT, true) }, h('span', { className: 'kd-resizer-grip', 'aria-hidden': 'true' })),
            chatOpen && (chatColumn || h('aside', { className: 'kd-chat' }, h('div', { className: 'kd-chat-head' }, h('span', { className: 'kd-chat-title' }, 'AI 讲解')), h('div', { className: 'kd-chat-empty' }, h('p', null, '选择工作区创建工作台会话后，可在这里与 AI 讨论。'), h('button', { className: 'kd-btn', style: { borderColor: 'var(--kd-accent)', color: 'var(--kd-accent)' }, onClick: startConversation, disabled: chatStarting }, '选择工作区并开始对话'))))));
      } catch (e) {
        return h('div', { className: 'kd-alert' }, h('pre', { style: { whiteSpace: 'pre-wrap', fontSize: 12 } }, (e && e.stack) || String(e)));
      }
    }

    let hostCtx = null;
    function apply(ctx) {
      hostCtx = ctx;
      ctx.effect(() => { const tag = document.createElement('style'); tag.setAttribute('data-plugin', 'dsh-k12-diagnose-workbench'); tag.textContent = CSS; document.head.appendChild(tag); return () => tag.remove(); });
      ctx.effect(() => ctx.desktopWorkbenches.register({ title: 'K12 图谱', panelTitle: '中小学知识图谱', repository: 'https://github.com/caisiyang123/k12-diagnose-workbench', description: '中小学·高中知识图谱（原站完整复刻）：知识图谱浏览、自适应诊断、孩子档案。', category: '教育', customFrame: true }, Panel));
    }
    return { apply, inject: ['desktopWorkbenches', 'uiSession', 'uiWorkspace'] };
  }
});
