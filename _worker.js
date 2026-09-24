// ==UserScript==
// @name         Pine-sub
// @namespace    https://pine-sub.nooh.cc
// @description  订阅管理面板 v2 — 界面美化 · 测速 · 流量统计 · Sing-box · 导出
// @version      2.0.0
// ==/UserScript==

const ADMIN_PASSWORD = 'wuandpl1982//@';
const SITE_TITLE = 'Pine-sub';
const SITE_DOMAIN = 'pine-sub.nooh.cc';
let SESSION_SECRET = 'pine-sub-session-secret-change-me';

// ── HTML 模板 ──
function renderHTML(data) {
  const { nodes, subs, tg } = data;
  const baseUrl = `https://${SITE_DOMAIN}`;

  const e = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  const nodeLines = (nodes||'').split('\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>${SITE_TITLE}</title>
<style>
:root{
  --bg:#f2f2f7;--card:#ffffff;--text:#1c1c1e;--text-sec:#636366;--sub:#8e8e93;
  --blue:#007aff;--blue-soft:rgba(0,122,255,0.08);--blue-border:rgba(0,122,255,0.2);
  --red:#ff3b30;--red-soft:rgba(255,59,48,0.08);
  --green:#34c759;--green-soft:rgba(52,199,89,0.08);
  --orange:#ff9500;--orange-soft:rgba(255,149,0,0.1);
  --border:rgba(60,60,67,0.1);--card-border:rgba(60,60,67,0.06);--input-bg:#f2f2f7;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.03);--shadow:0 3px 12px rgba(0,0,0,0.04);
  --radius:16px;--radius-sm:10px;
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,monospace;
}
.dark{
  --bg:#000000;--card:#1c1c1e;--text:#f5f5f7;--text-sec:#aeaeb2;--sub:#8e8e93;
  --blue:#0a84ff;--blue-soft:rgba(10,132,255,0.15);--blue-border:rgba(10,132,255,0.3);
  --red:#ff453a;--red-soft:rgba(255,69,58,0.15);
  --green:#30d158;--green-soft:rgba(48,209,88,0.15);
  --orange:#ff9f0a;--orange-soft:rgba(255,159,10,0.15);
  --border:rgba(255,255,255,0.1);--card-border:rgba(255,255,255,0.08);--input-bg:#2c2c2e;
  --shadow-sm:0 1px 3px rgba(0,0,0,0.2);--shadow:0 4px 18px rgba(0,0,0,0.35);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.45;-webkit-font-smoothing:antialiased}
.app{max-width:680px;margin:0 auto;padding:0 14px 60px}

/* 顶栏 */
.nav{display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:100;padding:12px 14px;margin:0 -14px 10px;border-bottom:1px solid var(--border);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}
.nav h1{font-size:20px;font-weight:700;letter-spacing:-0.4px;color:var(--text);display:flex;align-items:center;gap:6px;user-select:none}
.nav-actions{display:flex;gap:8px;align-items:center}
.nav-actions button,.nav-actions a{background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;text-decoration:none;transition:all .18s;box-shadow:var(--shadow-sm)}
.nav-actions button:active,.nav-actions a:active{transform:scale(.96);opacity:.8}

/* 标签分段器 */
.tabs{display:flex;gap:3px;background:rgba(118,118,128,0.12);border-radius:12px;padding:3px;margin-bottom:14px}
.tab{flex:1;text-align:center;padding:7px 0;border-radius:9px;font-size:13px;font-weight:600;color:var(--sub);cursor:pointer;transition:all .2s;border:none;background:transparent;user-select:none}
.tab.active{background:var(--card);color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.tab:not(.active):active{opacity:.6}
.tab-content{display:none}
.tab-content.active{display:block;animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}

/* 卡片基类 */
.card{background:var(--card);border-radius:var(--radius);padding:18px 16px;margin-bottom:12px;border:1px solid var(--card-border);box-shadow:var(--shadow)}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.card-title-group{display:flex;align-items:center;gap:8px;flex-shrink:0}
.card-main-title{font-size:17px;font-weight:700;letter-spacing:-0.3px;color:var(--text);white-space:nowrap}
.card-head-actions{display:flex;gap:6px;align-items:center}
.card-subtitle{font-size:12px;color:var(--sub);margin-bottom:12px;line-height:1.4}

/* 输入与通用按钮 */
input,textarea{width:100%;padding:11px 14px;background:var(--input-bg);border:1px solid transparent;border-radius:var(--radius-sm);font-size:14px;font-family:var(--font);color:var(--text);outline:none;transition:border-color .2s,background .2s}
input:focus,textarea:focus{border-color:var(--blue);background:var(--card)}
textarea{font-family:var(--mono);font-size:13px;line-height:1.45;resize:vertical;min-height:76px}
.btn{padding:9px 16px;border-radius:var(--radius-sm);font-size:14px;font-weight:600;border:none;cursor:pointer;color:#fff;background:var(--blue);transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn:active{transform:scale(.97)}
.btn-block{width:100%}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:8px}
.btn-pill{padding:5px 12px;font-size:12px;font-weight:600;border-radius:20px;background:var(--input-bg);color:var(--text);border:1px solid var(--border);cursor:pointer}
.btn-pill:active{transform:scale(.95);opacity:.8}
.btn-pill-orange{background:var(--orange-soft);color:var(--orange);border-color:rgba(255,149,0,0.25)}
.btn-green{background:var(--green)}
.btn-red{background:var(--red)}
.btn-orange{background:var(--orange)}
.btn-gray{background:var(--input-bg);color:var(--text);border:1px solid var(--border)}
.btn-ghost{background:transparent;color:var(--blue);padding:6px 8px;font-size:13px;font-weight:600}

/* 徽章 */
.badge{font-size:11px;padding:3px 7px;border-radius:6px;font-weight:600;display:inline-flex;align-items:center;line-height:1;white-space:nowrap}
.badge-blue{background:var(--blue-soft);color:var(--blue)}
.badge-orange{background:var(--orange-soft);color:var(--orange)}
.badge-green{background:var(--green-soft);color:var(--green)}
.badge-gray{background:rgba(142,142,147,0.12);color:var(--sub)}

/* 节点列表 */
#nodeList{display:none;margin-top:10px;animation:fadeIn .2s ease}
.node-card-item{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;background:var(--card);gap:10px;transition:all .15s}
.node-card-item:last-child{margin-bottom:0}
.node-card-item:active{transform:scale(.995)}
.node-idx-pill{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--sub);min-width:26px;text-align:center;padding:2px 4px;background:var(--input-bg);border-radius:6px;flex-shrink:0}
.node-info-box{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.node-full-title{font-size:14px;font-weight:600;color:var(--text);word-break:break-all;line-height:1.35}
.node-meta-row{display:flex;align-items:center;gap:6px;font-size:12px}
.node-addr-tag{font-family:var(--mono);color:var(--sub);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.node-actions-box{display:flex;align-items:center;gap:4px;flex-shrink:0}
.icon-action-btn{padding:6px 8px;font-size:11px;font-weight:600;border-radius:8px;background:var(--input-bg);color:var(--text-sec);border:1px solid var(--border);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:1;transition:all .15s}
.icon-action-btn:active{transform:scale(.92)}
.btn-action-del{color:var(--red);background:var(--red-soft);border-color:rgba(255,59,48,0.15)}

/* 订阅卡片 */
.sub-card{border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px;background:var(--card)}
.sub-card .name-input{background:transparent;border:none;font-size:17px;font-weight:700;padding:0;font-family:var(--font);color:var(--text);width:100%;cursor:text}
.sub-card .name-input:focus{border-bottom:2px solid var(--blue);border-radius:0;outline:none}
.sub-meta{display:flex;align-items:center;gap:8px;margin:6px 0 12px;font-size:12px;color:var(--sub)}
.link-list{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.link-row{display:flex;align-items:center;background:var(--input-bg);padding:7px 10px;border-radius:10px;gap:8px;border:1px solid var(--border)}
.link-label{font-size:11px;font-weight:700;color:var(--blue);width:50px;flex-shrink:0}
.link-url{font-family:var(--mono);font-size:11px;color:var(--text-sec);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;cursor:pointer}
.link-url:active{opacity:.6}
.sub-collapse{display:none;margin-top:10px;border-top:1px dashed var(--border);padding-top:12px;animation:fadeIn .2s ease}
.sub-collapse.open{display:block}
.sub-tools{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px}
.sub-tools .btn{width:100%;font-size:12px;padding:8px 0;font-weight:600}

/* 模态框 */
.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.45);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);display:none;align-items:center;justify-content:center;z-index:1000;padding:16px;opacity:0;transition:opacity .2s ease}
.modal-overlay.show{display:flex;opacity:1}
.modal-card{background:var(--card);border-radius:20px;padding:20px 18px;width:100%;max-width:440px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25);border:1px solid var(--border)}
.modal-title{font-size:17px;font-weight:700;margin-bottom:6px;text-align:center;color:var(--text)}
.modal-body{overflow-y:auto;flex:1;padding-right:2px;-webkit-overflow-scrolling:touch}
.modal-actions{display:flex;gap:10px;margin-top:14px}
.modal-actions .btn{flex:1}

/* 顺序调整项 */
.order-item-card{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--input-bg);border:1px solid var(--border);border-radius:12px;margin-bottom:6px;gap:8px}
.order-idx{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--sub);width:24px;text-align:center;flex-shrink:0}
.order-name{font-size:13px;font-weight:600;color:var(--text);flex:1;min-width:0;word-break:break-all;line-height:1.35}
.order-btns{display:flex;gap:4px;flex-shrink:0}

/* 授权勾选项 */
.auth-check-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:12px;margin-bottom:6px;cursor:pointer;transition:all .15s}
.auth-check-item:active{background:rgba(0,122,255,0.08);border-color:var(--blue-border)}
.auth-check-item input[type=checkbox]{width:18px;height:18px;margin:0;flex-shrink:0;accent-color:var(--blue)}
.auth-name{font-size:14px;font-weight:600;color:var(--text);flex:1;min-width:0;word-break:break-all;line-height:1.35}

/* toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--card);color:var(--text);padding:10px 22px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:9999;opacity:0;pointer-events:none;border:1px solid var(--border);transition:all .3s ease;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* 空态 */
.empty{text-align:center;color:var(--sub);padding:24px 0;font-size:13px}
@media(min-width:640px){.app{padding:0 24px 60px}.nav{padding:14px 24px;margin:0 -24px 14px}}
</style>
</head>
<body>
<div class="app">
  <!-- 顶栏 -->
  <div class="nav">
    <h1>${SITE_TITLE}</h1>
    <div class="nav-actions">
      <button onclick="toggleDark()" title="切换主题">🌙</button>
      <a href="/logout">退出</a>
    </div>
  </div>

  <!-- 隐藏数据 -->
  <textarea id="rawNodes" style="display:none">${e(nodes)}</textarea>
  <textarea id="rawSubs" style="display:none">${subs||'[]'}</textarea>

  <!-- 标签 -->
  <div class="tabs" id="tabs">
    <div class="tab active" data-tab="nodes">📦 节点</div>
    <div class="tab" data-tab="subs">🔗 订阅</div>
    <div class="tab" data-tab="tools">⚡ 工具</div>
  </div>

  <!-- ── Tab: 节点 ── -->
  <div class="tab-content active" id="tab-nodes">
    <div class="card">
      <div class="card-title">📥 输入转换</div>
      <div class="hint">粘贴 SS / VMess / Snell / Trojan 链接或 Surge 格式代码</div>
      <textarea id="nodesInput" placeholder="支持多行文本解析..."></textarea>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-block" onclick="appendNodes()">提交解析</button>
        <button class="btn btn-gray" onclick="document.getElementById('nodesInput').value=''">清除</button>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-title-group">
          <span class="card-main-title">🗂️ 节点库</span>
          <span class="badge badge-blue" id="nodeCount">${nodeLines.length}</span>
        </div>
        <div class="card-head-actions">
          <button class="btn btn-sm btn-pill btn-pill-orange" onclick="openOrderModal()">↕️ 调序</button>
          <button class="btn btn-sm btn-pill" onclick="toggleNodeList()" id="toggleNodesBtn">展开</button>
        </div>
      </div>
      <div class="card-subtitle">
        <span id="nodeProtoCount" style="font-weight:600;color:var(--text)"></span> · 顺序直接决定 Surge / Clash 等订阅更新次序
      </div>
      <div style="margin-bottom:8px">
        <input id="nodeFilter" placeholder="🔍 搜索节点名称或地址..." oninput="renderNodeList()">
      </div>
      <div id="nodeList"></div>
    </div>
  </div>

  <!-- ── Tab: 订阅 ── -->
  <div class="tab-content" id="tab-subs">
    <div class="card" style="padding:14px 20px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600">📡 订阅通道</span>
        <button class="btn btn-sm" onclick="addNewSub()">+ 新建</button>
      </div>
    </div>
    <div id="subsListContainer"></div>
  </div>

  <!-- ── Tab: 工具 ── -->
  <div class="tab-content" id="tab-tools">
    <div class="card">
      <div class="card-title">📤 导出</div>
      <div class="hint">导出节点和订阅配置</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" onclick="exportNodes()">导出节点 (txt)</button>
        <button class="btn btn-sm btn-green" onclick="exportSubs()">导出订阅 (json)</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">🤖 Telegram</div>
      <div class="hint">状态: <span style="color:${tg?'var(--green)':'var(--sub)'};font-weight:600">${tg?'已接入':'未接入'}</span></div>
      <input type="password" id="tgToken" placeholder="Bot Token" style="margin-bottom:10px">
      <button class="btn btn-block" style="background:#2AABEE" onclick="setupTg()">建立连接</button>
    </div>
  </div>

  <!-- ── Tab: 统计 ── -->
  </div>
</div>

<!-- 模态框：编辑节点 -->
<div class="modal-overlay" id="nodeEditModal">
  <div class="modal-card">
    <div class="modal-title">编辑节点</div>
    <div class="modal-body"><textarea id="nodeEditText" style="height:180px"></textarea></div>
    <div class="modal-actions"><button class="btn btn-gray" onclick="closeModal('nodeEditModal')">取消</button><button class="btn" onclick="saveEditNode()">保存</button></div>
  </div>
</div>

<!-- 模态框：节点授权 -->
<div class="modal-overlay" id="subSelectModal">
  <div class="modal-card">
    <div class="modal-title">节点授权分配</div>
    <div class="modal-body" id="subSelectBody"></div>
    <div class="modal-actions"><button class="btn btn-gray" onclick="closeModal('subSelectModal')">取消</button><button class="btn" onclick="saveSubSelection()">确认</button></div>
  </div>
</div>

<!-- 模态框：调整节点顺序（直接影响Surge等订阅输出顺序） -->
<div class="modal-overlay" id="nodeOrderModal">
  <div class="modal-card" style="max-width:460px">
    <div class="modal-title">调整节点订阅顺序</div>
    <div class="hint" style="text-align:center;margin-top:-8px;margin-bottom:12px;font-size:12px">
      此处保存的顺序即为 Surge / Clash / Sing-box 等订阅更新时的实际排列次序
    </div>
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button class="btn btn-sm btn-gray" style="flex:1" onclick="sortOrderByName()">🔤 按名称A-Z</button>
      <button class="btn btn-sm btn-gray" style="flex:1" onclick="sortOrderByProto()">🏷️ 按协议分组</button>
      <button class="btn btn-sm btn-gray" onclick="resetOrderModal()">↩️ 恢复初始</button>
    </div>
    <div class="modal-body" id="nodeOrderBody" style="max-height:55vh"></div>
    <div class="modal-actions">
      <button class="btn btn-gray" onclick="closeModal('nodeOrderModal')">取消</button>
      <button class="btn btn-green" onclick="saveNodeOrder()">保存并同步订阅</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
// ── 状态 ──
const baseUrl = '${baseUrl}';
let subs = []; let editingNodeIdx = -1; let editingSubId = null;
let openSubIds = [];

// ── 工具 ──
function $(id){return document.getElementById(id)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)}
function openModal(id){$(id).classList.add('show')}
function closeModal(id){$(id).classList.remove('show')}

function toggleDark(){
  document.body.classList.toggle('dark');
  localStorage.setItem('pine-sub-dark', document.body.classList.contains('dark')?'1':'');
}
if(localStorage.getItem('pine-sub-dark')==='1') document.body.classList.add('dark');

// ── 标签切换 ──
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    $( 'tab-'+tab.dataset.tab ).classList.add('active');
  });
});

// ── 链接解析 ──
function parseLink(line){
  line=line.trim();if(!line)return'';
  if(line.includes('=') && !line.startsWith('snell://') && !line.startsWith('ss://') && !line.startsWith('trojan://') && !line.startsWith('vmess://')) {
    const eq = line.indexOf('=');
    const name = line.substring(0, eq).trim();
    const cfg = line.substring(eq + 1).trim();
    const p = cfg.split(',').map(s => s.trim());
    if (p[0].toLowerCase() === 'shadowsocks') {
      let method = p[3] || '', pw = p[4] || '';
      if (pw.startsWith('"') && pw.endsWith('"')) pw = '"' + pw.slice(1, -1) + '"';
      let r = name + ' = ss, ' + p[1] + ', ' + p[2] + ', encrypt-method=' + method + ', password=' + pw + ', udp-relay=true';
      for (let i = 5; i < p.length; i++) {
        let kv = p[i];
        if (kv.startsWith('obfs-name=')) r += ', obfs=' + kv.split('=')[1];
        else if (kv.startsWith('obfs-host=')) r += ', obfs-host=' + kv.split('=')[1];
        else if (kv === 'fast-open=true') r += ', tfo=true';
        else if (kv === 'udp=true') {}
        else if (kv === 'block-quic=false') {}
        else r += ', ' + kv;
      }
      return r;
    }
    return line;
  }
  try{
    if(line.startsWith('snell://')){const u=new URL(line);return(decodeURIComponent(u.hash.slice(1))||'Snell')+' = snell, '+u.hostname+', '+u.port+', psk='+u.username+', version=4, reuse=true'}
    if(line.startsWith('trojan://')){const u=new URL(line);return(decodeURIComponent(u.hash.slice(1))||'Trojan')+' = trojan, '+u.hostname+', '+u.port+', password='+u.username+', udp-relay=true'}
    if(line.startsWith('ss://')){
      let s=line,n='SS节点';if(s.includes('#')){n=decodeURIComponent(s.split('#')[1]);s=s.split('#')[0]}
      const u=new URL(s);let core=s.slice(5).split('?')[0];if(core.endsWith('/'))core=core.slice(0,-1)
      let b=core,h=u.hostname,p=u.port
      if(core.includes('@')){b=core.split('@')[0];const hp=core.split('@')[1].split(':');h=hp[0];p=hp[1]}
      else{try{const d=atob(core);b=d.split('@')[0];const hp=d.split('@')[1].split(':');h=hp[0];p=hp[1]}catch(e){}}
      let mp=b;if(!mp.includes(':')){try{mp=atob(b)}catch(e){}}
      const m=mp.split(':')[0],pw=mp.split(':').slice(1).join(':')
      let r=n+' = ss, '+h+', '+p+', encrypt-method='+m+', password='+pw+', udp-relay=true'
      const q=s.includes('?')?s.split('?')[1]:'',pm=q.match(/plugin=([^&]+)/)
      if(pm){const ps=decodeURIComponent(pm[1]);if(ps.includes('obfs')){const ot=ps.includes('tls')?'tls':'http',hm=ps.match(/obfs-host=([^;]+)/);r+=', obfs='+ot+', obfs-host='+(hm?hm[1]:'bing.com')}}
      return r
    }
    if(line.startsWith('vmess://')){
      let b=line.slice(8).split('?')[0].split('#')[0],n='VMess';if(line.includes('#'))n=decodeURIComponent(line.split('#')[1])
      try{
        const d=decodeURIComponent(escape(atob(b)))
        if(d.startsWith('{')){const j=JSON.parse(d);n=j.ps||n;let r=n+' = vmess, '+j.add+', '+j.port+', username='+j.id;if(j.net==='ws')r+=', ws=true, ws-path='+(j.path||'/')+', ws-headers=Host:'+(j.host||j.add);if(j.tls==='tls')r+=', tls=true, sni='+(j.sni||j.host||j.add);return r}
      }catch(e){}
      const u=new URL(line),qs=new URLSearchParams(u.search);if(qs.get('remarks'))n=qs.get('remarks')
      const d2=atob(b),uuid=d2.split('@')[0].split(':')[1]||d2.split('@')[0],hp=d2.split('@')[1].split(':')
      let r=n+' = vmess, '+hp[0]+', '+hp[1]+', username='+uuid
      if(qs.get('obfs')==='websocket'||qs.get('obfs')==='ws')r+=', ws=true, ws-path='+(qs.get('path')||'/')+', ws-headers=Host:'+(qs.get('obfsParam')||hp[0])
      if(qs.get('tls')==='1')r+=', tls=true, sni='+(qs.get('peer')||qs.get('sni')||hp[0])
      return r
    }
  }catch(e){}
  return line
}

function getProto(line){
  const eq = line.indexOf('=');
  if (eq < 0) return 'UNKNOWN';
  const r = line.substring(eq + 1).trim().split(',')[0].trim().toLowerCase();
  if(r==='ss'||r==='shadowsocks')return'SS';if(r==='snell')return'Snell';if(r==='trojan')return'Trojan';if(r==='vmess')return'VMess'
  return r.toUpperCase()
}

function getNodeAddr(line){
  const eq = line.indexOf('=');
  if (eq < 0) return '';
  const p = line.substring(eq + 1).trim().split(',').map(s=>s.trim());
  if (p.length >= 3) return p[1] + ':' + p[2];
  return '';
}

// ── 节点列表 ──
function toggleNodeList(){
  const el=$('nodeList'),btn=$('toggleNodesBtn')
  if(el.style.display==='block'){el.style.display='none';btn.textContent='展开'}
  else{el.style.display='block';btn.textContent='收起';renderNodeList()}
}

function renderNodeList(){
  const el=$('nodeList'),raw=$('rawNodes')
  const lines=raw.value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'))
  const q=($('nodeFilter').value||'').trim().toLowerCase()
  let filtered=q?lines.filter(l=>l.toLowerCase().includes(q)):lines.slice()
  if($('nodeCount')) $('nodeCount').textContent=lines.length
  const ss=lines.filter(l=>{const p=l.split('=')[1];return p&&(p.trim().toLowerCase().startsWith('ss,')||p.trim().toLowerCase().startsWith('shadowsocks,'))}).length
  const sn=lines.length-ss
  if($('nodeProtoCount')) $('nodeProtoCount').textContent=sn+' Snell · '+ss+' SS'
  if(!filtered.length){el.innerHTML=lines.length?'<div class="empty">无匹配节点</div>':'<div class="empty">暂无节点</div>';return}
  el.innerHTML=filtered.map((l)=>{
    const realIdx=lines.indexOf(l);
    const name=l.split('=')[0].trim(),proto=getProto(l),addr=getNodeAddr(l);
    const badgeCls=proto==='SS'?'badge-blue':'badge-orange';
    return \`<div class="node-card-item">
      <span class="node-idx-pill">#\${realIdx+1}</span>
      <div class="node-info-box">
        <div class="node-title-row">
          <span class="node-full-title">\${name}</span>
        </div>
        <div class="node-meta-row">
          <span class="badge \${badgeCls}">\${proto}</span>
          \${addr?\`<span class="node-addr-tag">\${addr}</span>\`:''}
        </div>
      </div>
      <div class="node-actions-box">
        <button class="icon-action-btn" title="上移" onclick="moveNodeDirect(\${realIdx}, -1)">▲</button>
        <button class="icon-action-btn" title="下移" onclick="moveNodeDirect(\${realIdx}, 1)">▼</button>
        <button class="icon-action-btn" onclick="editNode(\${realIdx})">编辑</button>
        <button class="icon-action-btn btn-action-del" onclick="deleteNode(\${realIdx})">删除</button>
      </div>
    </div>\`
  }).join('')
}

async function moveNodeDirect(i, dir){
  const raw=$('rawNodes');
  let lines=raw.value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));
  const target=i+dir;
  if(target<0 || target>=lines.length) return;
  const temp=lines[i];
  lines[i]=lines[target];
  lines[target]=temp;
  raw.value=lines.join('\\n');
  const ok=await saveNodes();
  if(ok) toast('顺序已更新');
}

// ── 调整顺序专属弹窗 ──
let orderLines=[], initialOrderLines=[];

function openOrderModal(){
  const raw=$('rawNodes');
  orderLines=raw.value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));
  if(!orderLines.length){toast('暂无节点');return}
  initialOrderLines=orderLines.slice();
  renderOrderModalList();
  openModal('nodeOrderModal');
}

function renderOrderModalList(){
  const body=$('nodeOrderBody');
  let html='<div style="display:flex;flex-direction:column;gap:6px">';
  orderLines.forEach((l,i)=>{
    const name=l.split('=')[0].trim();
    const p=getProto(l);
    const badgeCls=p==='SS'?'badge-blue':'badge-orange';
    html+='<div class="order-item-card">'
      +'<span class="order-idx">#'+(i+1)+'</span>'
      +'<span class="order-name">'+name+'</span>'
      +'<span class="badge '+badgeCls+'" style="flex-shrink:0">'+p+'</span>'
      +'<div class="order-btns">'
      +'<button class="icon-action-btn" title="置顶" onclick="moveOrderTop('+i+')">🔝</button>'
      +'<button class="icon-action-btn" title="上移" onclick="moveOrderItem('+i+', -1)">▲</button>'
      +'<button class="icon-action-btn" title="下移" onclick="moveOrderItem('+i+', 1)">▼</button>'
      +'</div>'
      +'</div>';
  });
  html+='</div>';
  body.innerHTML=html;
}

function moveOrderTop(i){
  if(i===0) return;
  const item=orderLines.splice(i,1)[0];
  orderLines.unshift(item);
  renderOrderModalList();
}

function moveOrderItem(i, dir){
  if(dir===-1){
    if(i===0) return;
    const temp=orderLines[i];
    orderLines[i]=orderLines[i-1];
    orderLines[i-1]=temp;
  }else if(dir===1){
    if(i===orderLines.length-1) return;
    const temp=orderLines[i];
    orderLines[i]=orderLines[i+1];
    orderLines[i+1]=temp;
  }
  renderOrderModalList();
}

function sortOrderByName(){
  orderLines.sort((a,b)=>a.split('=')[0].trim().localeCompare(b.split('=')[0].trim(),'zh-CN'));
  renderOrderModalList();
}

function sortOrderByProto(){
  orderLines.sort((a,b)=>getProto(a).localeCompare(getProto(b))||a.split('=')[0].localeCompare(b.split('=')[0],'zh-CN'));
  renderOrderModalList();
}

function resetOrderModal(){
  orderLines=initialOrderLines.slice();
  renderOrderModalList();
  toast('已恢复初始顺序');
}

async function saveNodeOrder(){
  if(!orderLines.length) return;
  $('rawNodes').value=orderLines.join('\\n');
  const ok=await saveNodes();
  if(ok){
    closeModal('nodeOrderModal');
    toast('已保存新顺序，Surge等订阅已同步更新！');
  }
}

// ── 节点 CRUD ──
async function saveNodes(v){
  const r=await fetch('/api/save_nodes',{method:'POST',body:v||$('rawNodes').value})
  if(!r.ok){toast('保存失败');return false}
  renderNodeList();return true
}

async function appendNodes(){
  const inp=$('nodesInput'),raw=$('rawNodes')
  const lines=inp.value.trim().split('\\n').filter(l=>l.trim()).map(l=>parseLink(l.trim())).filter(l=>l)
  if(!lines.length){toast('无有效节点');return}
  raw.value=raw.value.trim()?(raw.value.trim()+'\\n'+lines.join('\\n')):lines.join('\\n')
  inp.value=''
  if(await saveNodes()) toast('已录入 '+lines.length+' 个节点')
}

function editNode(i){
  editingNodeIdx=i
  const lines=$('rawNodes').value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'))
  $('nodeEditText').value=lines[i]
  openModal('nodeEditModal')
}

async function saveEditNode(){
  const lines=$('rawNodes').value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'))
  const v=$('nodeEditText').value.trim()
  if(!v){toast('内容不能为空');return}
  lines[editingNodeIdx]=v
  $('rawNodes').value=lines.join('\\n')
  if(await saveNodes()){closeModal('nodeEditModal');toast('已更新')}
}

async function deleteNode(i){
  if(!confirm('删除此节点？'))return
  const lines=$('rawNodes').value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'))
  lines.splice(i,1);$('rawNodes').value=lines.join('\\n')
  if(await saveNodes()) toast('已删除')
}

// ── 订阅 ──
function renderSubs(){
  const c=$('subsListContainer')
  if(!subs.length){c.innerHTML='<div class="empty">暂无订阅通道，点击上方创建</div>';return}
  c.innerHTML=subs.map((sub,idx)=>{
    const tag=sub.type==='all'?'<span class="badge badge-green">全量节点</span>':'<span class="badge badge-orange" style="word-break:keep-all;white-space:nowrap">限定 '+sub.selected.length+' 个</span>'
    const u=baseUrl+'/sub/'+sub.token+'/universal',s=baseUrl+'/sub/'+sub.token+'/surge',v=baseUrl+'/sub/'+sub.token+'/v2ray',cl=baseUrl+'/sub/'+sub.token+'/clash',sb=baseUrl+'/sub/'+sub.token+'/singbox'
    const open=openSubIds.includes(sub.id),cls=open?'open':'',tgl=open?'收起 ▴':'展开 ▾'
    return \`<div class="sub-card">
      <input class="name-input" style="width:100%;word-break:break-all" value="\${sub.name}" onchange="updateSub(subs[\${idx}].id,'name',this.value)" placeholder="名称">
      <div class="sub-meta">\${tag} · ID: \${sub.token.slice(0,8)}...</div>
      <div class="link-list">
        <div class="link-row"><span class="link-label" style="flex-shrink:0">通用</span><span class="link-url" onclick="copy('\${u}')">\${u}</span><button class="btn btn-sm btn-gray" style="flex-shrink:0" onclick="copy('\${u}')">复制</button></div>
      </div>
      <button class="btn btn-ghost" style="width:100%;font-size:13px" onclick="toggleSub(\${idx})">\${tgl}</button>
      <div class="sub-collapse \${cls}" id="sc-\${idx}">
        <div class="link-list">
          <div class="link-row"><span class="link-label">V2ray</span><span class="link-url" onclick="copy('\${v}')">\${v}</span><button class="btn btn-sm btn-gray" onclick="copy('\${v}')">复制</button></div>
          <div class="link-row"><span class="link-label">Surge</span><span class="link-url" onclick="copy('\${s}')">\${s}</span><button class="btn btn-sm btn-gray" onclick="copy('\${s}')">复制</button></div>
          <div class="link-row"><span class="link-label">Clash</span><span class="link-url" onclick="copy('\${cl}')">\${cl}</span><button class="btn btn-sm btn-gray" onclick="copy('\${cl}')">复制</button></div>
          <div class="link-row"><span class="link-label">Sing-box</span><span class="link-url" onclick="copy('\${sb}')">\${sb}</span><button class="btn btn-sm btn-gray" onclick="copy('\${sb}')">复制</button></div>
        </div>
        <div class="sub-tools">
          <button class="btn btn-sm btn-gray" onclick="triggerSelect(subs[\${idx}].id)">节点授权</button>
          <button class="btn btn-sm btn-orange" onclick="refreshToken(subs[\${idx}].id)">重置</button>
          \${subs.length>1?'<button class="btn btn-sm btn-red" onclick="deleteSub(subs[\${idx}].id)">删除</button>':''}
        </div>
      </div>
    </div>\`
  }).join('')
}

async function syncSubs(){
  const r=await fetch('/api/save_subs',{method:'POST',body:JSON.stringify(subs)})
  if(!r.ok)toast('同步失败')
}

function updateSub(id,k,v){const s=subs.find(x=>x.id===id);if(s&&v.trim()){s[k]=v.trim();renderSubs();syncSubs()}}
function toggleSub(idx){const id=subs[idx]?subs[idx].id:idx;const el=$('sc-'+idx);if(!el)return;el.classList.toggle('open');const i=openSubIds.indexOf(id);i>-1?openSubIds.splice(i,1):openSubIds.push(id);renderSubs()}

function addNewSub(){
  const c='abcdefghijklmnopqrstuvwxyz0123456789'
  let r='';for(let i=0;i<16;i++)r+=c[Math.random()*c.length|0]
  subs.unshift({id:Date.now()+'',name:'新通道',token:r,type:'all',selected:[]})
  openSubIds.push(subs[0].id);renderSubs();syncSubs()
}

function deleteSub(id){if(!confirm('废除后链接将失效'))return;subs=subs.filter(s=>s.id!==id);renderSubs();syncSubs()}
function refreshToken(id){if(!confirm('重置凭证？'))return;const s=subs.find(x=>x.id===id);if(s){const c='abcdefghijklmnopqrstuvwxyz0123456789';let r='';for(let i=0;i<16;i++)r+=c[Math.random()*c.length|0];s.token=r;renderSubs();syncSubs();toast('已重置')}}

function triggerSelect(id){
  editingSubId=id;const sub=subs.find(s=>s.id===id),raw=$('rawNodes');
  let lines=raw.value.split('\\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));
  if(!lines.length){toast('节点库为空');return}
  let html='<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'
    +'<button class="btn btn-sm btn-gray" onclick="modalCheckAll(true)">全选</button>'
    +'<button class="btn btn-sm btn-gray" onclick="modalCheckAll(false)">清空</button>'
    +'<button class="btn btn-sm btn-gray" onclick="modalCheckSS()">仅选SS</button>'
    +'<button class="btn btn-sm btn-gray" onclick="modalCheckSnell()">仅选Snell</button>'
    +'</div><div style="display:flex;flex-direction:column;gap:6px">';
  lines.forEach((l,i)=>{
    const n=l.split('=')[0].trim(),p=getProto(l),ck=sub.type==='all'||(sub.selected||[]).includes(n);
    const badgeCls=p==='SS'?'badge-blue':'badge-orange';
    html+='<label class="auth-check-item">'
      +'<span class="order-idx">#'+(i+1)+'</span>'
      +'<input type="checkbox" class="ncb" data-proto="'+p+'" value="'+n.replace(/"/g,'&quot;')+'" '+(ck?'checked':'')+'>'
      +'<span class="auth-name">'+n+'</span>'
      +'<span class="badge '+badgeCls+'" style="flex-shrink:0">'+p+'</span></label>';
  });
  html+='</div>';$('subSelectBody').innerHTML=html;openModal('subSelectModal');
}

function modalCheckAll(checked){
  document.querySelectorAll('.ncb').forEach(c=>{c.checked=checked})
}

function modalCheckSS(){
  document.querySelectorAll('.ncb').forEach(c=>{c.checked=(c.dataset.proto==='SS')})
}

function modalCheckSnell(){
  document.querySelectorAll('.ncb').forEach(c=>{c.checked=(c.dataset.proto==='Snell')})
}

function saveSubSelection(){
  const cbs=document.querySelectorAll('.ncb'),sel=[],all=cbs.length>0
  cbs.forEach(cb=>{if(cb.checked)sel.push(cb.value)})
  const sub=subs.find(s=>s.id===editingSubId)
  sub.type=cbs.length===sel.length?'all':'select';sub.selected=sel
  renderSubs();syncSubs();closeModal('subSelectModal')
}

// ── 导出 ──
function exportNodes(){
  const raw=$('rawNodes').value
  const blob=new Blob([raw],{type:'text/plain'}),a=document.createElement('a')
  a.href=URL.createObjectURL(blob);a.download='pine-sub-nodes-'+new Date().toISOString().slice(0,10)+'.txt'
  a.click();toast('节点已导出')
}

function exportSubs(){
  const blob=new Blob([JSON.stringify(subs,null,2)],{type:'application/json'}),a=document.createElement('a')
  a.href=URL.createObjectURL(blob);a.download='pine-sub-subs-'+new Date().toISOString().slice(0,10)+'.json'
  a.click();toast('订阅配置已导出')
}

// ── Telegram ──
async function setupTg(){
  const tk=$('tgToken').value.trim();if(!tk)return
  const r=await fetch('/api/setup_tg',{method:'POST',body:tk})
  toast(r.ok?'Telegram 已连接':'Token 无效')
}

// ── 复制 ──
function copy(t){
  if(navigator.clipboard) navigator.clipboard.writeText(t).then(()=>toast('已复制'))
  else{const i=document.createElement('input');i.value=t;document.body.appendChild(i);i.select();document.execCommand('copy');document.body.removeChild(i);toast('已复制')}
}

// ── 初始化 ──
function initApp(){
  try{subs=JSON.parse($('rawSubs').value)}catch(e){subs=[]}
  renderNodeList();
  renderSubs();
}
if(document.readyState==='loading'){
  window.addEventListener('DOMContentLoaded',initApp);
}else{
  initApp();
}
<\x2Fscript>
</body>
</html>`;
}

// ── 订阅格式生成 ──
function manualB64(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '', bytes = [];
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
  for (let i = 0; i < bytes.length; i += 3) {
    const b = (bytes[i] << 16) | ((i+1 < bytes.length ? bytes[i+1] : 0) << 8) | (i+2 < bytes.length ? bytes[i+2] : 0);
    result += chars[(b >> 18) & 63] + chars[(b >> 12) & 63] + chars[(b >> 6) & 63] + chars[b & 63];
  }
  const pad = bytes.length % 3;
  if (pad === 1) result = result.slice(0, -2) + '==';
  else if (pad === 2) result = result.slice(0, -1) + '=';
  return result;
}

function genV2ray(lines, token, baseUrl) {
  // V2Ray 订阅格式: Base64 编码的 URI 列表
  // v2rayN/Shadowrocket/Loon 等客户端通用格式
  let uris = [];
  lines.forEach(l => {
    if (!l.includes('=')) return;
    const eq = l.indexOf('=');
    const name = l.substring(0, eq).trim();
    const cfg = l.substring(eq + 1).trim();
    const p = cfg.split(',').map(s=>s.trim());
    if (p[0] === 'ss' || p[0] === 'Shadowsocks' || p[0] === 'shadowsocks') {
      let method = '', pw = '';
      if (p[0] === 'Shadowsocks' || p[0] === 'shadowsocks') {
        method = p[3] || '';
        pw = p[4] || '';
      } else {
        p.forEach(x => { if (x.startsWith('encrypt-method=')) method = x.slice(15); if (x.startsWith('password=')) pw = x.slice(9); });
      }
      // 找 obfs 参数（可能在 p[5] 及之后）
      let obfs = '', obfsHost = '';
      p.slice(5).forEach(x => {
        if (x.startsWith('obfs-name=') || x.startsWith('obfs=')) obfs = x.split('=')[1];
        if (x.startsWith('obfs-host=')) obfsHost = x.split('=')[1];
      });
      // 去引号
      if (pw.startsWith('"') && pw.endsWith('"')) pw = pw.slice(1, -1);
      const raw = method + ':' + pw;
      let uri = 'ss://' + manualB64(raw) + '@' + p[1] + ':' + p[2];
      if (obfs) uri += '/?plugin=' + encodeURIComponent('obfs-local;obfs=' + obfs + ';obfs-host=' + (obfsHost || 'bing.com'));
      uri += '#' + encodeURIComponent(name);
      uris.push(uri);
    } else if (p[0] === 'trojan') {
      let pw='';
      p.forEach(x => { if(x.startsWith('password=')) pw=x.slice(9); });
      uris.push('trojan://' + encodeURIComponent(pw) + '@' + p[1] + ':' + p[2] + '#' + encodeURIComponent(name));
    }
  });
  if (uris.length === 0) return manualB64('No compatible nodes for this client. Snell nodes are not supported in v2ray format. Use universal/surge format instead.');
  const text = uris.join('\n');
  return manualB64(text);
}

function genClash(lines) {
  let y = 'port: 7890\nsocks-port: 7891\nmode: Rule\nlog-level: info\nproxies:\n';
  lines.forEach(l => {
    if (!l.includes('=')) return;
    const eq = l.indexOf('=');
    const name = l.substring(0, eq).trim();
    const cfg = l.substring(eq + 1).trim();
    const p = cfg.split(',').map(s=>s.trim());
    if (p[0] === 'snell') {
      let psk='', ver='2', obfs='', obfsHost='';
      p.forEach(x => { if(x.startsWith('psk=')) psk=x.slice(4); if(x.startsWith('version=')) ver=x.slice(8); if(x.startsWith('obfs=')) obfs=x.slice(5); if(x.startsWith('obfs-host=')) obfsHost=x.slice(10); });
      y += `  - name: "${name}"\n    type: snell\n    server: ${p[1]}\n    port: ${p[2]}\n    psk: ${psk}\n    version: ${ver}\n`;
      if (obfs) y += `    obfs-opts:\n      mode: ${obfs}\n      host: ${obfsHost||''}\n`;
    }
  });
  y += 'proxy-groups:\n  - name: Proxy\n    type: select\n    proxies:\n';
  lines.forEach(l => { if(l.includes('=')) y += `      - "${l.split('=')[0].trim()}"\n`; });
  y += 'rules:\n  - MATCH,Proxy\n';
  return y;
}

function genSingbox(lines) {
  const outbounds = [];
  lines.forEach(l => {
    if (!l.includes('=')) return;
    const eq = l.indexOf('=');
    const name = l.substring(0, eq).trim();
    const cfg = l.substring(eq + 1).trim();
    const p = cfg.split(',').map(s=>s.trim());
    if (p[0] === 'snell') {
      let psk='', ver='2';
      p.forEach(x => { if(x.startsWith('psk=')) psk=x.slice(4); if(x.startsWith('version=')) ver=x.slice(8); });
      outbounds.push({
        type: 'snell', tag: name, server: p[1], server_port: parseInt(p[2]),
        psk, version: parseInt(ver)||2
      });
    }
  });
  return JSON.stringify({
    log: {level: 'info'},
    dns: {servers: [{address: '1.1.1.1', address_resolver: 'local'}, {tag: 'local', address: 'local'}]},
    inbounds: [{type: 'mixed', listen: '0.0.0.0', listen_port: 2080}],
    outbounds: outbounds.concat([{type: 'direct', tag: 'direct'}, {type: 'block', tag: 'block'}, {type: 'dns', tag: 'dns-out'}]),
    route: {rules: [{protocol: 'dns', outbound: 'dns-out'}], auto_detect_interface: true}
  }, null, 2);
}

// ── 订阅请求 ──
async function handleSub(req, env, token, format) {
  const kv = env.KV_STORE;
  if (!kv) return new Response('KV not configured', {status:500});
  const baseUrl = 'https://' + SITE_DOMAIN;
  const [raw, subsRaw] = await Promise.all([kv.get('surge_nodes')||'', kv.get('pine_subs')||'[]']);
  const subs = JSON.parse(subsRaw);
  const sub = subs.find(s => s.token === token);
  if (!sub) return new Response('Not Found', {status: 404, headers: {'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});

  const all = raw.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('#'));
  let sel = sub.type === 'all' ? all : all.filter(l => (sub.selected||[]).includes(l.split('=')[0].trim()));
  if (!sel.length) return new Response('', {status:200, headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});

  let body='', ct='text/plain;charset=utf-8';
  switch(format) {
    case 'surge': body = sel.join('\n')+'\n'; break;
    case 'v2ray': body = await genV2ray(sel, token, baseUrl); break;
    case 'clash': body = genClash(sel); ct = 'text/yaml;charset=utf-8'; break;
    case 'singbox': body = genSingbox(sel); ct = 'application/json;charset=utf-8'; break;
    default: body = sel.join('\n')+'\n';
  }
  return new Response(body, {status:200, headers:{'Content-Type':ct,'Cache-Control':'no-store','Profile-Update-Interval':'6'}});
}

// ── 会话管理 ──
async function createSession(env) {
  const c='abcdefghijklmnopqrstuvwxyz0123456789'; let s='';
  for(let i=0;i<32;i++) s+=c[Math.random()*c.length|0];
  if(env.KV_STORE) await env.KV_STORE.put('session_'+s,'active',{expirationTtl:86400});
  return s;
}

async function validateSession(req, env) {
  const ck = (req.headers.get('Cookie')||'').split(';').filter(c=>c.trim()).reduce((o,c)=>{const[k,...v]=c.trim().split('=');o[k.trim()]=v.join('=').trim();return o}, {});
  const sid = ck['pine_session'];
  if (!sid) return false;
  if (env.KV_STORE) return (await env.KV_STORE.get('session_'+sid)) === 'active';
  return sid.startsWith(SESSION_SECRET.slice(0,8));
}

// ── 登录页 ──
function loginPage(err) {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no"><title>' + SITE_TITLE + ' 控制台</title><style>' +
'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f2f2f7;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}' +
'.card{background:#fff;width:90%;max-width:360px;padding:40px 24px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.04);text-align:center}' +
'h1{font-size:24px;margin:0 0 8px;font-weight:700;background:linear-gradient(135deg,#007aff,#5856d6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
'p{color:#86868b;font-size:14px;margin-bottom:30px}' +
'input{width:100%;padding:14px 16px;border:1px solid #d2d2d7;border-radius:10px;font-size:16px;text-align:center;outline:none;transition:.2s;box-sizing:border-box}' +
'input:focus{border-color:#007aff}' +
'button{width:100%;padding:14px;background:#007aff;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:500;cursor:pointer;margin-top:16px}' +
'.error{color:#ff3b30;font-size:13px;display:' + (err ? 'block' : 'none') + ';margin-top:12px}' +
'</style></head><body><div class="card"><h1>' + SITE_TITLE + '</h1><p>控制终端访问授权</p><form action="/login" method="POST"><input type="password" name="password" placeholder="管理密钥" required autofocus><div class="error">密钥验证失败</div><button type="submit">系统验证</button></form></div></body></html>';
}

// ── 入口 ──
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), path = url.pathname;
    const adminPW = env.ADMIN_KEY || ADMIN_PASSWORD;
    if (env.SESSION_SECRET) SESSION_SECRET = env.SESSION_SECRET;

    if (request.method === 'OPTIONS') return new Response(null, {headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});

    // 订阅链接（无需认证）
    const subMatch = path.match(/^\/sub\/([a-z0-9]+)\/(universal|v2ray|surge|clash|singbox)$/);
    if (subMatch) return handleSub(request, env, subMatch[1], subMatch[2]);

    // 登录
    if (path === '/login' && request.method === 'POST') {
      const fd = await request.text();
      const pw = new URLSearchParams(fd).get('password');
      if (pw === adminPW) {
        const sessionId = await createSession(env);
        const [nodes, subs, tg] = await Promise.all([
          env.KV_STORE ? env.KV_STORE.get('surge_nodes') : '',
          env.KV_STORE ? env.KV_STORE.get('pine_subs') : '[]',
          env.KV_STORE ? env.KV_STORE.get('tg_bot_token') : ''
        ]);
        return new Response(renderHTML({nodes, subs, tg: !!tg}), {
          status: 200,
          headers: {'Content-Type':'text/html;charset=utf-8', 'Set-Cookie': `pine_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`}
        });
      }
      return new Response(loginPage(true), {status:200, headers:{'Content-Type':'text/html;charset=utf-8'}});
    }

    // 登出
    if (path === '/logout') {
      const ck = (request.headers.get('Cookie')||'').split(';').filter(c=>c.trim()).reduce((o,c)=>{const[k,...v]=c.trim().split('=');o[k.trim()]=v.join('=').trim();return o}, {});
      if (ck['pine_session'] && env.KV_STORE) await env.KV_STORE.delete('session_'+ck['pine_session']);
      return new Response(loginPage(false), {status:200, headers:{'Content-Type':'text/html;charset=utf-8','Set-Cookie':'pine_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'}});
    }

    // 鉴权
    const authed = await validateSession(request, env);
    if (!authed) {
      if (path.startsWith('/api/')) return new Response('Unauthorized', {status:401});
      if (path.startsWith('/sub/')) return new Response('Error 403: Subscription token invalid', {status:403});
      return new Response(loginPage(false), {status:200, headers:{'Content-Type':'text/html;charset=utf-8'}});
    }

    // 主页
    if (path === '/' || path === '/admin') {
      const [nodes, subs, tg] = await Promise.all([
        env.KV_STORE ? env.KV_STORE.get('surge_nodes') : '',
        env.KV_STORE ? env.KV_STORE.get('pine_subs') : '[]',
        env.KV_STORE ? env.KV_STORE.get('tg_bot_token') : ''
      ]);
      return new Response(renderHTML({nodes, subs, tg: !!tg}), {status:200, headers:{'Content-Type':'text/html;charset=utf-8'}});
    }

    // API
    if (path === '/api/save_nodes' && request.method === 'POST') {
      if (env.KV_STORE) await env.KV_STORE.put('surge_nodes', await request.text());
      return new Response('OK');
    }
    if (path === '/api/save_subs' && request.method === 'POST') {
      if (env.KV_STORE) await env.KV_STORE.put('pine_subs', await request.text());
      return new Response('OK');
    }
    if (path === '/api/setup_tg' && request.method === 'POST') {
      if (env.KV_STORE) await env.KV_STORE.put('tg_bot_token', await request.text());
      return new Response('OK');
    }
    if (path === '/api/export/nodes') {
      const nodes = await (env.KV_STORE ? env.KV_STORE.get('surge_nodes') : '');
      return new Response(nodes||'', {status:200, headers:{'Content-Type':'text/plain;charset=utf-8','Content-Disposition':'attachment; filename="pine-nodes.txt"'}});
    }
    if (path === '/api/export/subs') {
      const subs = await (env.KV_STORE ? env.KV_STORE.get('pine_subs') : '[]');
      return new Response(subs||'[]', {status:200, headers:{'Content-Type':'application/json;charset=utf-8','Content-Disposition':'attachment; filename="pine-subs.json"'}});
    }

    if (path === '/favicon.ico') return new Response('', {status:204});
    return new Response('Not Found', {status:404});
  }
};

//
