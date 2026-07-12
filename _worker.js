// ==UserScript==
// @name         Pine-sub
// @namespace    https://pine-sub.nooh.cc
// @description  订阅管理面板 — Cloudflare Workers
// @version      1.0.0
// ==/UserScript==

// ========== 配置区 ==========
const ADMIN_PASSWORD = 'your-admin-password-here'; // 管理密钥，建议通过环境变量 ADMIN_KEY 设置
const SITE_TITLE = 'Pine-sub';
const SITE_DOMAIN = 'pine-sub.nooh.cc';

// Session 密钥（用于签名 cookie，建议环境变量 SESSION_SECRET 覆盖）
let SESSION_SECRET = 'pine-sub-session-secret-change-me';

// ========== KV Namespace ==========
// 绑定名: KV (在 wrangler.toml 中配置)
// KV 存储键:
//   nodes  — 节点原始数据（多行 Surge 格式文本）
//   subs   — 订阅通道配置（JSON 数组）
//   tg_token — Telegram Bot Token

// ========== HTML 模板 ==========
function renderHTML(nodesData, subsData, tgStatus) {
  const baseUrl = `https://${SITE_DOMAIN}`;
  const subsStr = subsData || '[]';

  // 安全转义
  const escapeHtml = (s) => {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${SITE_TITLE}</title>
<style>
:root { --bg: #f5f5f7; --card: #ffffff; --text: #1d1d1f; --sub: #86868b; --blue: #007aff; --red: #ff3b30; --border: #e5e5ea; --green: #34c759; --orange: #ff9500; --light-blue: #f0f8ff;}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 16px; line-height: 1.5; }
.app { max-width: 640px; margin: 0 auto; padding-bottom: 40px; }
.header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 24px; }
h1 { font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px; }
.logout { color: var(--red); text-decoration: none; font-size: 14px; padding: 6px 12px; background: rgba(255,59,48,0.08); border-radius: 12px; font-weight: 500; }
.card { background: var(--card); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.02); }
.card-title { font-size: 17px; font-weight: 600; margin: 0 0 6px 0; display: flex; align-items: center; justify-content: space-between; }
.hint { font-size: 13px; color: var(--sub); margin-bottom: 16px; }
input, textarea { width: 100%; padding: 14px 16px; background: var(--bg); border: 1px solid transparent; border-radius: 10px; font-size: 14px; font-family: ui-monospace, SFMono-Regular, monospace; outline: none; transition: 0.2s; }
input:focus, textarea:focus { border-color: rgba(0,122,255,0.4); background: #fff; box-shadow: 0 0 0 3px rgba(0,122,255,0.1); }
button { padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; color: white; background: var(--blue); transition: 0.2s; }
button:active { transform: scale(0.98); opacity: 0.9; }
.btn-green { background: var(--green); }
.btn-red { background: var(--red); }
.btn-orange { background: var(--orange); }
.btn-gray { background: #e5e5ea; color: var(--text); }
.btn-text { background: transparent; color: var(--blue); border: none; font-size: 14px; padding: 4px 8px; font-weight: 500; }
.sub-badge { font-size: 12px; color: var(--orange); background: rgba(255,149,0,0.1); padding: 3px 8px; border-radius: 6px; font-weight: 500; margin-left: 8px; display: inline-block; }
#visualNodeList { display: none; transition: all 0.3s ease; }
.node-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; background: #fafafa; }
.node-info { flex: 1; display: grid; grid-template-columns: 1fr 64px; align-items: center; gap: 12px; min-width: 0; padding-right: 12px; }
.node-name { font-weight: 500; font-size: 14px; color: var(--text); word-wrap: break-word; white-space: normal; line-height: 1.4; overflow: visible; }
.node-tag { font-size: 11px; padding: 4px 0; border-radius: 6px; font-weight: 600; text-align: center; width: 64px; letter-spacing: 0.5px; font-family: -apple-system, sans-serif; }
.tag-ss { background: rgba(0,122,255,0.1); color: var(--blue); }
.tag-snell { background: rgba(255,149,0,0.1); color: var(--orange); }
.tag-trojan { background: rgba(52,199,89,0.1); color: var(--green); }
.tag-other { background: #e5e5ea; color: #666; }
.node-action { flex-shrink: 0; display: flex; gap: 8px; }
.node-action button { margin: 0; padding: 6px 12px; font-size: 13px; border-radius: 6px; width: auto; }
.empty-state { text-align: center; color: var(--sub); padding: 20px 0; font-size: 13px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 16px; opacity: 0; transition: opacity 0.2s; }
.modal-overlay.show { display: flex; opacity: 1; }
.modal-card { background: #fff; border-radius: 16px; padding: 24px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); max-height: 90vh; display: flex; flex-direction: column; }
.modal-title { font-size: 17px; font-weight: 600; margin-bottom: 16px; text-align: center; }
.modal-body { overflow-y: auto; margin-bottom: 16px; flex: 1; }
.sub-item { border: 1px solid var(--border); padding: 20px 16px; border-radius: 12px; margin-bottom: 16px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.sub-header { margin-bottom: 8px; }
.sub-header input { background: transparent; border: none; font-size: 18px; font-weight: 600; padding: 0; font-family: -apple-system, sans-serif; color: var(--text); width: 100%; }
.sub-header input:focus { background: transparent; box-shadow: none; border-bottom: 1px solid var(--blue); border-radius: 0; }
.sub-meta { display: flex; align-items: center; margin-bottom: 16px; }
.sub-badge.all { color: var(--green); background: rgba(52,199,89,0.1); margin-left: 0; }
.link-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.link-row { display: flex; align-items: center; background: var(--light-blue); padding: 8px 12px; border-radius: 8px; gap: 10px; }
.link-label { font-size: 13px; font-weight: 500; color: var(--blue); width: 45px; flex-shrink: 0; }
.link-url { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; color: var(--sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.copy-btn { background: #fff; color: var(--blue); padding: 4px 10px; font-size: 12px; font-weight: 500; margin: 0; width: auto; border: 1px solid rgba(0,122,255,0.15); border-radius: 6px; flex-shrink: 0; }
.btn-toggle-sub { background: transparent; color: var(--blue); border: none; width: 100%; padding: 8px 0 0 0; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; }
.btn-toggle-sub:active { opacity: 0.7; transform: scale(1); background: transparent; }
.sub-collapse-area { display: none; margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 16px; }
.sub-collapse-area.open { display: block; }
.sub-tools { display: flex; gap: 8px; margin-top: 16px; }
.sub-tools button { flex: 1; margin: 0; padding: 10px 0; font-size: 13px; border-radius: 8px; font-weight: 500; }
</style>
</head>
<body>
<div class="app">
  <div class="header"><h1>${SITE_TITLE}</h1><a href="/logout" class="logout">系统注销</a></div>

  <textarea id="rawNodes" style="display:none;">${escapeHtml(nodesData)}</textarea>
  <textarea id="rawSubs" style="display:none;">${subsStr}</textarea>

  <div class="card">
     <h3 class="card-title">节点输入转换</h3>
     <div class="hint">粘贴多行 SS / VMess / Snell 链接或 Surge纯代码，系统将自动清洗录入。</div>
     <textarea id="nodesInputBox" style="height:100px; margin-bottom:12px;" placeholder="支持多行文本解析..."></textarea>
     <button style="width:100%;" onclick="appendNodes()">提交解析</button>
  </div>

  <div class="card">
     <div class="card-title">
        <div style="display:flex; align-items:center;">
            节点存储库 <span class="sub-badge" id="nodeCountBadge" style="margin-left:8px;">已收录 0 个节点</span>
        </div>
        <button id="toggleNodesBtn" class="btn-text" onclick="toggleNodeList()">展开 ▾</button>
     </div>
     <div class="hint" style="margin-bottom: 0;">列表内节点可被分配至不同订阅通道。</div>
     <div id="visualNodeList" style="margin-top: 16px;"></div>
  </div>

  <div class="card" style="background: #fcfcfc;">
     <div class="card-title">
        <span>多路订阅分发</span>
        <button style="margin:0; width:auto; padding:6px 12px; font-size:13px; border-radius:8px;" onclick="addNewSub()">新建订阅通道</button>
     </div>
     <div class="hint">分配独立节点权限，一键生成四种主流客户端配置。</div>
     <div id="subsListContainer"></div>
  </div>

  <div class="card">
     <h3 class="card-title">Telegram 管家</h3>
     <div class="hint">绑定机器人后，可远程操控系统与发送解析指令。当前状态: <span style="color:${tgStatus ? '#34c759' : '#86868b'};font-weight:500;">${tgStatus ? '已接入' : '未接入'}</span></div>
     <input type="password" id="tgTokenInput" placeholder="填入 Bot Token" style="margin-bottom:12px;">
     <button style="width:100%; background:#2AABEE;" onclick="setupTg()">建立连接</button>
  </div>
</div>

<div id="nodeEditModal" class="modal-overlay">
  <div class="modal-card">
    <div class="modal-title">底层参数配置</div>
    <div class="modal-body"><textarea id="nodeEditTextarea" style="height:200px; background:#f5f5f7; border:1px solid #e5e5ea; font-family: monospace;" placeholder="遵循 Surge 格式规范"></textarea></div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><button class="btn-gray" onclick="closeModal('nodeEditModal')">取消</button><button onclick="saveEditNode()">应用修改</button></div>
  </div>
</div>

<div id="subSelectModal" class="modal-overlay">
  <div class="modal-card">
    <div class="modal-title">节点授权分配</div>
    <div class="modal-body" id="subSelectCbList"></div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><button class="btn-gray" onclick="closeModal('subSelectModal')">取消</button><button onclick="saveSubSelection()">保存授权</button></div>
  </div>
</div>

<script>
const baseUrl = '${baseUrl}';
let pineSubs = []; let editingNodeIndex = -1; let editingSubId = null;
let isNodeListVisible = false;
let openSubIds = [];

function parseProxyLinkClient(line) {
    line = line.trim(); if(!line) return "";
    if(line.includes('=') && !/^(snell|ss|trojan|vmess):\/\//i.test(line)) return line;
    try {
        if(line.startsWith('snell://')) { const u = new URL(line); return decodeURIComponent(u.hash.slice(1))||"Snell" + " = snell, " + u.hostname + ", " + u.port + ", psk=" + u.username + ", version=4, reuse=true"; }
        if(line.startsWith('trojan://')) { const u = new URL(line); return decodeURIComponent(u.hash.slice(1))||"Trojan" + " = trojan, " + u.hostname + ", " + u.port + ", password=" + u.username + ", udp-relay=true"; }
        if(line.startsWith('ss://')) {
            let urlStr = line; let name = "SS节点";
            if(urlStr.includes('#')) { name = decodeURIComponent(urlStr.split('#')[1]); urlStr = urlStr.split('#')[0]; }
            let u = new URL(urlStr); let core = urlStr.slice(5).split('?')[0]; if(core.endsWith('/')) core = core.slice(0, -1);
            let b64Str = core, host = u.hostname, port = u.port;
            if(core.includes('@')) { b64Str = core.split('@')[0]; let hp = core.split('@')[1].split(':'); host = hp[0]; port = hp[1]; }
            else { try { let dec = atob(core); b64Str = dec.split('@')[0]; let hp = dec.split('@')[1].split(':'); host = hp[0]; port = hp[1]; } catch(e){} }
            let methodPwd = b64Str; if(!methodPwd.includes(':')) { try { methodPwd = atob(b64Str); } catch(e){} }
            let method = methodPwd.split(':')[0], pwd = methodPwd.split(':').slice(1).join(':');
            let res = name + " = ss, " + host + ", " + port + ", encrypt-method=" + method + ", password=" + pwd + ", udp-relay=true";
            let search = u.search.substring(1); let pluginMatch = search.match(/plugin=([^&]+)/);
            if(pluginMatch) {
                let pluginStr = decodeURIComponent(pluginMatch[1]);
                if (pluginStr.includes('obfs')) {
                    let obfsType = pluginStr.includes('tls') ? 'tls' : 'http'; let hostMatch = pluginStr.match(/obfs-host=([^;]+)/);
                    res += ", obfs=" + obfsType + ", obfs-host=" + (hostMatch ? hostMatch[1] : 'bing.com');
                }
            }
            return res;
        }
        if(line.startsWith('vmess://')) {
            let body = line.slice(8).split('?')[0].split('#')[0]; let name = "VMess节点"; if(line.includes('#')) name = decodeURIComponent(line.split('#')[1]);
            try {
                let dec = decodeURIComponent(escape(atob(body)));
                if(dec.startsWith('{')) {
                    let j = JSON.parse(dec); name = j.ps || name;
                    let res = name + " = vmess, " + j.add + ", " + j.port + ", username=" + j.id;
                    if(j.net === 'ws') res += ", ws=true, ws-path=" + (j.path || '/') + ", ws-headers=Host:" + (j.host || j.add);
                    if(j.tls === 'tls') res += ", tls=true, sni=" + (j.sni || j.host || j.add);
                    return res;
                }
            } catch(e) {}
            let u = new URL(line); let params = new URLSearchParams(u.search); if(params.get('remarks')) name = params.get('remarks');
            let dec2 = atob(body); let uuid = dec2.split('@')[0].split(':')[1] || dec2.split('@')[0];
            let hp = dec2.split('@')[1].split(':'); let res = name + " = vmess, " + hp[0] + ", " + hp[1] + ", username=" + uuid;
            if(params.get('obfs') === 'websocket' || params.get('obfs') === 'ws') res += ", ws=true, ws-path=" + (params.get('path') || '/') + ", ws-headers=Host:" + (params.get('obfsParam') || hp[0]);
            if(params.get('tls') === '1') res += ", tls=true, sni=" + (params.get('peer') || params.get('sni') || hp[0]);
            return res;
        }
    } catch(e) {}
    return line;
}

function copyText(txt) {
  if(navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => alert('已复制到剪贴板')).catch(() => {});
  } else {
    const input = document.createElement('input'); input.value = txt; document.body.appendChild(input);
    input.select(); document.execCommand('copy'); document.body.removeChild(input); alert('已复制到剪贴板');
  }
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function toggleNodeList() {
    const list = document.getElementById('visualNodeList'); const btn = document.getElementById('toggleNodesBtn');
    isNodeListVisible = !isNodeListVisible;
    list.style.display = isNodeListVisible ? 'block' : 'none';
    btn.textContent = isNodeListVisible ? '收起 ▴' : '展开 ▾';
}

function getNodeProtocol(line) {
    let raw = line.split('=')[1]; if(!raw) return 'UNKNOWN';
    let p = raw.split(',')[0].trim().toLowerCase();
    if(p === 'ss') return 'SS'; if(p === 'snell') return 'SNELL'; if(p === 'trojan') return 'TROJAN'; if(p === 'vmess') return 'VMESS';
    return p.toUpperCase();
}

function getTagClass(proto) {
    if(proto === 'SS') return 'tag-ss'; if(proto === 'SNELL') return 'tag-snell';
    if(proto === 'TROJAN') return 'tag-trojan'; return 'tag-other';
}

function renderNodeList() {
    const rawBox = document.getElementById('rawNodes'); const listDiv = document.getElementById('visualNodeList');
    const badge = document.getElementById('nodeCountBadge');
    let lines = rawBox.value.split('\\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    badge.textContent = '已收录 ' + lines.length + ' 个节点';
    if(lines.length === 0) { listDiv.innerHTML = '<div class="empty-state">暂无节点，请在输入框粘贴并提交</div>'; return; }
    let html = '';
    lines.forEach((line, idx) => {
        let name = line.split('=')[0].trim();
        let proto = getNodeProtocol(line);
        let tagClass = getTagClass(proto);
        html += '<div class="node-item"><div class="node-info"><span class="node-name">' + name + '</span><span class="node-tag ' + tagClass + '">' + proto + '</span></div><div class="node-action"><button style="background:#f0f0f5;color:var(--text);" onclick="editNode(' + idx + ')">编辑</button><button class="btn-red" style="width:auto;padding:6px 12px;" onclick="deleteNode(' + idx + ')">删除</button></div></div>';
    });
    listDiv.innerHTML = html;
}

async function appendNodes() {
    const inputBox = document.getElementById('nodesInputBox'); const rawBox = document.getElementById('rawNodes');
    let raw = inputBox.value.trim(); if(!raw) return;
    let lines = raw.split('\\n').filter(l => l.trim());
    let converted = lines.map(l => parseProxyLinkClient(l.trim())).filter(l => l);
    let existing = rawBox.value.trim();
    let newVal = existing ? existing + '\\n' + converted.join('\\n') : converted.join('\\n');
    rawBox.value = newVal; inputBox.value = '';
    const res = await fetch('/api/save_nodes', { method: 'POST', body: rawBox.value });
    if(res.ok) { renderNodeList(); renderSubsList(); alert('解析成功，已录入 ' + converted.length + ' 个节点'); }
    else { alert('保存失败'); }
}

function editNode(index) {
    editingNodeIndex = index; const rawBox = document.getElementById('rawNodes');
    let lines = rawBox.value.split('\\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    document.getElementById('nodeEditTextarea').value = lines[index]; openModal('nodeEditModal');
}

function saveEditNode() {
    const rawBox = document.getElementById('rawNodes'); let lines = rawBox.value.split('\\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    let newText = document.getElementById('nodeEditTextarea').value.trim();
    if(!newText) { alert('内容不能为空'); return; }
    lines[editingNodeIndex] = newText; rawBox.value = lines.join('\\n');
    fetch('/api/save_nodes', { method: 'POST', body: rawBox.value }).then(r => { if(r.ok) { renderNodeList(); closeModal('nodeEditModal'); } });
}

function deleteNode(index) {
    if(!confirm('确认删除该节点？')) return;
    const rawBox = document.getElementById('rawNodes'); let lines = rawBox.value.split('\\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    lines.splice(index, 1);
    rawBox.value = lines.join('\\n');
    fetch('/api/save_nodes', { method: 'POST', body: rawBox.value }).then(r => { if(r.ok) renderNodeList(); });
}

function toggleSub(id) {
    const area = document.getElementById('sub-collapse-' + id);
    const btn = document.getElementById('btn-toggle-' + id);
    if(area.classList.contains('open')) {
        area.classList.remove('open');
        btn.innerHTML = '展开更多格式与管理 ▾';
        const idx = openSubIds.indexOf(id);
        if(idx > -1) openSubIds.splice(idx, 1);
    } else {
        area.classList.add('open');
        btn.innerHTML = '收起管理面板 ▴';
        openSubIds.push(id);
    }
}

function renderSubsList() {
  const container = document.getElementById('subsListContainer'); let html = '';
  pineSubs.forEach(sub => {
    let tagHtml = sub.type === 'all'
      ? '<span class="sub-badge all" style="margin-left:0;">分配全量节点权限</span>'
      : '<span class="sub-badge" style="margin-left:0;">限定分配 ' + sub.selected.length + ' 个节点</span>';
    let uLink = baseUrl + '/sub/' + sub.token + '/universal';
    let sLink = baseUrl + '/sub/' + sub.token + '/surge';
    let vLink = baseUrl + '/sub/' + sub.token + '/v2ray';
    let cLink = baseUrl + '/sub/' + sub.token + '/clash';

    let isOpen = openSubIds.includes(sub.id);
    let collapseClass = isOpen ? 'open' : '';
    let toggleText = isOpen ? '收起管理面板 ▴' : '展开更多格式与管理 ▾';

    html += '<div class="sub-item">'
      + '<div class="sub-header"><input type="text" value="' + sub.name + '" onchange="updateSubData(\\'' + sub.id + '\\', \\'name\\', this.value)" placeholder="配置表备注名称"></div>'
      + '<div class="sub-meta">' + tagHtml + '</div>'
      + '<div class="link-list" style="margin-bottom:0;"><div class="link-row"><div class="link-label">通用</div><div class="link-url">' + uLink + '</div><button class="copy-btn" onclick="copyText(\\'' + uLink + '\\')">复制</button></div></div>'
      + '<button id="btn-toggle-' + sub.id + '" class="btn-toggle-sub" onclick="toggleSub(\\'' + sub.id + '\\')">' + toggleText + '</button>'
      + '<div class="sub-collapse-area ' + collapseClass + '" id="sub-collapse-' + sub.id + '">'
      + '<div class="link-list">'
      + '<div class="link-row"><div class="link-label">V2ray</div><div class="link-url">' + vLink + '</div><button class="copy-btn" onclick="copyText(\\'' + vLink + '\\')">复制</button></div>'
      + '<div class="link-row"><div class="link-label">Surge</div><div class="link-url">' + sLink + '</div><button class="copy-btn" onclick="copyText(\\'' + sLink + '\\')">复制</button></div>'
      + '<div class="link-row"><div class="link-label">Clash</div><div class="link-url">' + cLink + '</div><button class="copy-btn" onclick="copyText(\\'' + cLink + '\\')">复制</button></div>'
      + '</div>'
      + '<div class="sub-tools">'
      + '<button style="background:#f0f0f5; color:var(--text);" onclick="triggerSubSelect(\\'' + sub.id + '\\')">节点授权</button>'
      + '<button class="btn-orange" onclick="refreshSubToken(\\'' + sub.id + '\\')">重置凭证</button>'
      + (pineSubs.length > 1 ? '<button class="btn-red" onclick="deleteSub(\\'' + sub.id + '\\')">废除链接</button>' : '')
      + '</div></div></div>';
  });
  container.innerHTML = html;
}

async function syncSaveSubsToCloud() {
  const res = await fetch('/api/save_subs', { method: 'POST', body: JSON.stringify(pineSubs) });
  if(!res.ok) alert('配置网络同步失败');
}

function updateSubData(id, key, val) {
  let sub = pineSubs.find(s => s.id === id);
  if(sub && val.trim()) { sub[key] = val.trim(); renderSubsList(); syncSaveSubsToCloud(); }
}

function addNewSub() {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let r = ''; for(let i=0; i<16; i++) r+=c.charAt(Math.floor(Math.random()*c.length));
  const newId = Date.now().toString();
  pineSubs.unshift({ id: newId, name: '新增分发通道', token: r, type: 'all', selected: [] });
  openSubIds.push(newId);
  renderSubsList(); syncSaveSubsToCloud();
}

function deleteSub(id) {
  if(!confirm('废除后外部设备将失去连接，且无法恢复。是否继续？')) return;
  pineSubs = pineSubs.filter(s => s.id !== id);
  renderSubsList(); syncSaveSubsToCloud();
}

function refreshSubToken(id) {
  if(!confirm('重置将改变提取密钥，原先的链接会立即断开。确认重置？')) return;
  let sub = pineSubs.find(s => s.id === id);
  if(sub) {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = ''; for(let i=0; i<16; i++) r+=c.charAt(Math.floor(Math.random()*c.length));
    sub.token = r; renderSubsList(); syncSaveSubsToCloud(); alert('凭证重置成功');
  }
}

function triggerSubSelect(subId) {
  editingSubId = subId; const sub = pineSubs.find(s => s.id === subId);
  const lines = document.getElementById('rawNodes').value.split('\\n').filter(l => l.trim() && !l.startsWith('#'));
  let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
  if(lines.length === 0) { html += '<div class="empty-state">资源库空缺，请先录入</div>'; }
  else {
     lines.forEach(line => {
       let parts = line.split('='); let name = parts[0].trim();
       let pRaw = parts[1].split(',')[0].trim().toLowerCase();
       let proto = 'UNKNOWN'; let tagClass = 'tag-other';
       if(pRaw === 'ss') { proto = 'SS'; tagClass = 'tag-ss'; } else if(pRaw === 'snell') { proto = 'SNELL'; tagClass = 'tag-snell'; }
       else if(pRaw === 'trojan') { proto = 'TROJAN'; tagClass = 'tag-trojan'; } else if(pRaw === 'vmess') { proto = 'VMESS'; tagClass = 'tag-other'; }
       else { proto = pRaw.toUpperCase(); }
       const isChecked = sub.type === 'all' || (sub.selected && sub.selected.includes(name));
       html += '<label style="display:flex;align-items:center;gap:12px;padding:12px;background:#f5f5f7;border-radius:10px;cursor:pointer;">'
            + '<input type="checkbox" class="sub-node-cb" value="' + name.replace(/"/g, '&quot;') + '" ' + (isChecked?'checked':'') + ' style="width:18px;height:18px;margin:0;flex-shrink:0;">'
            + '<div style="flex:1; display:grid; grid-template-columns:1fr 64px; gap:12px; align-items:center; padding-right:4px;">'
            + '<span style="font-size:14px;word-break:break-word;font-weight:500;">' + name + '</span>'
            + '<span class="node-tag ' + tagClass + '">' + proto + '</span></div></label>';
     });
  }
  html += '</div>'; document.getElementById('subSelectCbList').innerHTML = html; openModal('subSelectModal');
}

function saveSubSelection() {
  const cbs = document.querySelectorAll('.sub-node-cb'); let selectedNames = []; let allChecked = true;
  cbs.forEach(cb => { if(cb.checked) selectedNames.push(cb.value); else allChecked = false; });
  const sub = pineSubs.find(s => s.id === editingSubId);
  sub.type = allChecked ? 'all' : 'select'; sub.selected = selectedNames;
  renderSubsList(); syncSaveSubsToCloud(); closeModal('subSelectModal');
}

async function setupTg() {
  const tk = document.getElementById('tgTokenInput').value.trim(); if(!tk) return;
  const res = await fetch('/api/setup_tg', { method: 'POST', body: tk });
  if(res.ok) alert('Telegram 终端已成功握手'); else alert('Token 校验失败');
}

window.onload = () => {
  try { pineSubs = JSON.parse(document.getElementById('rawSubs').value); } catch(e){}
  renderNodeList();
  renderSubsList();
};
<\/script>
</body>
</html>`;
}

// ========== 节点名称提取 ==========
function parseNodeName(line) {
  if (!line || !line.includes('=')) return '';
  return line.split('=')[0].trim();
}

function parseNodeConfig(line) {
  if (!line || !line.includes('=')) return null;
  return line.trim();
}

// ========== 订阅格式生成 ==========
function generateUniversal(lines) {
  // 直接输出 Surge 格式节点列表
  return lines.join('\n') + '\n';
}

function generateV2ray(lines) {
  // 转成 V2Ray 客户端可识别的格式（base64 编码的 vmess/ss 链接）
  // 如果是 Surge 格式的节点，直接返回 Surge 格式文本
  return lines.join('\n') + '\n';
}

function generateSurge(lines) {
  return lines.join('\n') + '\n';
}

function generateClash(lines) {
  // 将 Surge 格式的 Snell 节点转成 Clash 格式
  let clashConfig = `port: 7890
socks-port: 7891
mode: Rule
log-level: info
allow-lan: true
external-controller: 127.0.0.1:9090
proxies:\n`;

  lines.forEach(line => {
    if (!line || !line.includes('=')) return;
    let parts = line.split('=');
    let name = parts[0].trim();
    let config = parts[1].trim();
    let configParts = config.split(',').map(s => s.trim());

    let type = configParts[0];
    let server = configParts[1];
    let port = configParts[2];

    if (type === 'snell') {
      let psk = '';
      let version = '2';
      let obfs = '';
      let obfsHost = '';
      configParts.forEach(p => {
        if (p.startsWith('psk=')) psk = p.slice(4);
        if (p.startsWith('version=')) version = p.slice(8);
        if (p.startsWith('obfs=')) obfs = p.slice(5);
        if (p.startsWith('obfs-host=')) obfsHost = p.slice(10);
      });

      clashConfig += `  - name: "${name}"
    type: snell
    server: ${server}
    port: ${port}
    psk: ${psk}
    version: ${version}
    obfs-opts:
      mode: ${obfs || 'http'}
      host: ${obfsHost || ''}\n`;
    }
  });

  clashConfig += `\nproxy-groups:
  - name: "Proxy"
    type: select
    proxies:\n`;
  lines.forEach(line => {
    if (!line || !line.includes('=')) return;
    let name = line.split('=')[0].trim();
    clashConfig += `      - "${name}"\n`;
  });

  clashConfig += `\nrules:
  - MATCH,Proxy\n`;

  return clashConfig;
}

// ========== 订阅请求处理 ==========
async function handleSubscription(request, kv, token, format) {
  // 加载节点数据
  let nodesRaw = await kv.get('nodes') || '';
  let subsRaw = await kv.get('subs') || '[]';

  let subs;
  try { subs = JSON.parse(subsRaw); } catch(e) { subs = []; }

  // 查找匹配的订阅通道
  let sub = subs.find(s => s.token === token);
  if (!sub) {
    return new Response('Subscription not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  // 获取所有节点行
  let allLines = nodesRaw.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));

  // 筛选授权节点
  let selectedLines = [];
  if (sub.type === 'all') {
    selectedLines = allLines;
  } else {
    let selectedNames = sub.selected || [];
    selectedLines = allLines.filter(line => {
      let name = parseNodeName(line);
      return selectedNames.includes(name);
    });
  }

  if (selectedLines.length === 0) {
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  let body = '';
  let contentType = 'text/plain; charset=utf-8';

  switch (format) {
    case 'universal':
      body = generateUniversal(selectedLines);
      break;
    case 'v2ray':
      body = generateV2ray(selectedLines);
      break;
    case 'surge':
      body = generateSurge(selectedLines);
      break;
    case 'clash':
      body = generateClash(selectedLines);
      contentType = 'text/yaml; charset=utf-8';
      break;
    default:
      body = generateUniversal(selectedLines);
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'Profile-Update-Interval': '6'
    }
  });
}

// ========== 会话管理 ==========
async function createSession(env) {
  let sessionId = '';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // 存储到 KV
  if (env.KV) {
    await env.KV.put('session_' + sessionId, 'active', { expirationTtl: 86400 }); // 24h
  }
  return sessionId;
}

async function validateSession(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').filter(c => c.trim()).map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key.trim(), val.join('=').trim()];
    })
  );

  const sessionId = cookies['pine_session'];
  if (!sessionId) return false;

  if (env.KV) {
    const session = await env.KV.get('session_' + sessionId);
    return session === 'active';
  }
  // 无 KV 时，用简单方法（不安全，仅开发用）
  return sessionId.startsWith(SESSION_SECRET.slice(0, 8));
}

// ========== Cloudflare Worker 入口 ==========
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 环境变量覆盖
    const adminPassword = env.ADMIN_KEY || ADMIN_PASSWORD;
    if (env.SESSION_SECRET) SESSION_SECRET = env.SESSION_SECRET;

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // ======== 路由 ========

    // 登录页面
    if (path === '/login' && request.method === 'POST') {
      const formData = await request.text();
      const params = new URLSearchParams(formData);
      const password = params.get('password');

      if (password === adminPassword) {
        const sessionId = await createSession(env);
        const html = renderHTML(
          await (env.KV ? env.KV.get('nodes') : Promise.resolve('')),
          await (env.KV ? env.KV.get('subs') : Promise.resolve('[]')),
          await (env.KV ? env.KV.get('tg_token') : Promise.resolve('')) ? true : false
        );
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Set-Cookie': `pine_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
          }
        });
      } else {
        // 返回登录页（带错误提示）
        return new Response(getLoginPage(true), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // 登出
    if (path === '/logout') {
      // 清除 session
      const cookieHeader = request.headers.get('Cookie') || '';
      const cookies = Object.fromEntries(
        cookieHeader.split(';').filter(c => c.trim()).map(c => {
          const [key, ...val] = c.trim().split('=');
          return [key.trim(), val.join('=').trim()];
        })
      );
      const sessionId = cookies['pine_session'];
      if (sessionId && env.KV) {
        await env.KV.delete('session_' + sessionId);
      }
      return new Response(getLoginPage(false), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Set-Cookie': 'pine_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        }
      });
    }

    // 验证会话（除登录/登出外的所有路径都需要）
    const isAuth = await validateSession(request, env);

    if (!isAuth) {
      // 如果是 API 请求，返回 401
      if (path.startsWith('/api/')) {
        return new Response('Unauthorized', { status: 401 });
      }
      // 如果是订阅请求，返回 403
      if (path.startsWith('/sub/')) {
        return new Response('Error 403: Subscription token invalid', { status: 403 });
      }
      // 返回登录页
      return new Response(getLoginPage(false), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // ======== 已认证路由 ========

    // 主页
    if (path === '/' || path === '/admin') {
      const nodesData = await (env.KV ? env.KV.get('nodes') : Promise.resolve(''));
      const subsData = await (env.KV ? env.KV.get('subs') : Promise.resolve('[]'));
      const tgToken = await (env.KV ? env.KV.get('tg_token') : Promise.resolve(''));
      const html = renderHTML(nodesData || '', subsData || '[]', tgToken ? true : false);
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // API: 保存节点
    if (path === '/api/save_nodes' && request.method === 'POST') {
      const body = await request.text();
      if (env.KV) await env.KV.put('nodes', body);
      return new Response('OK', { status: 200 });
    }

    // API: 保存订阅配置
    if (path === '/api/save_subs' && request.method === 'POST') {
      const body = await request.text();
      if (env.KV) await env.KV.put('subs', body);
      return new Response('OK', { status: 200 });
    }

    // API: 设置 Telegram Token
    if (path === '/api/setup_tg' && request.method === 'POST') {
      const token = await request.text();
      if (env.KV) await env.KV.put('tg_token', token);
      return new Response('OK', { status: 200 });
    }

    // 订阅链接
    const subMatch = path.match(/^\/sub\/([a-z0-9]+)\/(universal|v2ray|surge|clash)$/);
    if (subMatch) {
      const token = subMatch[1];
      const format = subMatch[2];
      return handleSubscription(request, env, token, format);
    }

    // 静态文件
    if (path === '/favicon.ico') {
      return new Response('', { status: 204 });
    }

    // 404
    return new Response('Not Found', { status: 404 });
  }
};

// ========== 登录页面 ==========
function getLoginPage(showError) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${SITE_TITLE} 控制台</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
.login-card { background: #fff; width: 90%; max-width: 360px; padding: 40px 24px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); text-align: center; }
h1 { font-size: 24px; margin: 0 0 8px 0; color: #1d1d1f; font-weight: 600; letter-spacing: -0.5px; }
p { color: #86868b; font-size: 14px; margin-bottom: 30px; }
input[type="password"] { width: 100%; padding: 14px 16px; border: 1px solid #d2d2d7; border-radius: 10px; font-size: 16px; margin-bottom: 20px; box-sizing: border-box; text-align: center; outline: none; transition: border-color 0.2s; }
input[type="password"]:focus { border-color: #007aff; }
button { width: 100%; padding: 14px; background: #007aff; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 500; cursor: pointer; transition: 0.2s; }
button:active { transform: scale(0.98); opacity: 0.9; }
.error { color: #ff3b30; font-size: 13px; margin-top: -10px; margin-bottom: 16px; display: ${showError ? 'block' : 'none'}; }
</style>
</head>
<body>
<div class="login-card">
<h1>${SITE_TITLE}</h1>
<p>控制终端访问授权</p>
<form action="/login" method="POST">
<input type="password" name="password" placeholder="输入管理密钥" required autofocus>
<div class="error">密钥验证失败，请重试</div>
<button type="submit">系统验证</button>
</form>
</div>
</body>
</html>`;
}
