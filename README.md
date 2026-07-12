# Pine-sub v2

基于 Cloudflare Workers 的订阅管理面板 — 界面美化 · 多路分发 · 测速 · 统计 · 导出

## 功能

- **📦 节点管理** — 自动解析 SS/VMess/Snell/Trojan/Surge 格式，支持编辑/删除
- **🔗 多路订阅分发** — 创建多个订阅通道，每个通道独立分配节点权限
- **📡 五种订阅格式** — Universal / V2Ray / Surge / Clash / **Sing-box**
- **⚡ 节点测速** — 一键测试所有节点 HTTP 延迟，结果实时显示
- **📊 访问统计** — 统计每个订阅链接的被请求次数（持久化到 KV）
- **📤 导出** — 导出节点 (txt) 和订阅配置 (json)
- **🌙 暗色模式** — 支持明暗主题切换
- **🤖 Telegram 集成** — 绑定 Bot Token 远程管理

## 界面

- Apple 风格设计，响应式布局
- 四标签导航：节点 / 订阅 / 工具 / 统计
- 节点延迟彩色指示（绿 < 300ms / 橙 < 800ms / 红 > 800ms）

## 部署

### 前置

1. Cloudflare 账户 + Workers 订阅
2. 创建一个 KV 命名空间

### 步骤

```bash
# 1. 克隆
git clone https://github.com/Pinevu/pine-sub.git
cd pine-sub

# 2. 创建 KV 命名空间
npx wrangler kv:namespace create "KV"

# 3. 编辑 wrangler.toml
#    - 填入 KV 命名空间 ID
#    - 设置 ADMIN_KEY（管理密码）
#    - 设置 SESSION_SECRET（随机字符串）

# 4. 部署
npx wrangler deploy
```

### 或通过 CF Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → 创建 Worker
3. 将 `_worker.js` 全部内容粘贴到编辑器
4. 设置 > 变量：
   - `ADMIN_KEY` — 管理密码
   - `SESSION_SECRET` — 会话密钥
5. 设置 > KV 命名空间绑定：绑定名为 `KV`
6. 部署

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `ADMIN_KEY` | 管理面板登录密钥 | ✅ |
| `SESSION_SECRET` | 会话签名密钥 | ✅ |
| `KV` | KV 命名空间绑定 | ✅ |

## API 端点

| 路径 | 方法 | 说明 |
|------|------|------|
| `/login` | POST | 密钥登录 |
| `/logout` | GET | 登出 |
| `/api/save_nodes` | POST | 保存节点 |
| `/api/save_subs` | POST | 保存订阅配置 |
| `/api/setup_tg` | POST | 设置 Telegram |
| `/api/export/nodes` | GET | 导出节点 |
| `/api/export/subs` | GET | 导出订阅配置 |
| `/sub/:token/:format` | GET | 订阅链接 |

## 订阅格式

- `universal` — Surge 格式
- `v2ray` — Surge 格式
- `surge` — Surge 格式
- `clash` — Clash YAML
- `singbox` — Sing-box JSON

## 许可

MIT
