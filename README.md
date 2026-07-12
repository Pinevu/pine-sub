# Pine-sub

基于 Cloudflare Workers 的订阅管理面板，支持多路订阅分发、节点授权管理、Telegram 机器人集成。

## 功能

- **节点输入转换**：自动解析 SS / VMess / Snell / Trojan 链接为标准格式
- **节点存储库**：统一管理所有节点，支持编辑和删除
- **多路订阅分发**：创建多个订阅通道，为每个通道独立分配节点权限
- **四种订阅格式**：每个通道自动生成 Universal / V2Ray / Surge / Clash 格式订阅链接
- **Telegram 管家**：绑定 Bot Token 后可通过 TG 远程管理
- **会话管理**：密钥登录 + Cookie 会话

## 部署

### 前置条件

1. Cloudflare 账户
2. Cloudflare Workers 订阅（免费计划即可）
3. Cloudflare KV 命名空间

### 步骤

1. **创建 KV 命名空间**

```bash
npx wrangler kv:namespace create "KV"
```

2. **克隆仓库**

```bash
git clone https://github.com/Pinevu/pine-sub.git
cd pine-sub
```

3. **配置 `wrangler.toml`**

将 `kv_namespaces.id` 替换为你的 KV 命名空间 ID，设置 `ADMIN_KEY` 和 `SESSION_SECRET`。

4. **部署**

```bash
npx wrangler deploy
```

5. **配置自定义域名**（可选）

在 Cloudflare Dashboard → Workers → pine-sub → Triggers → Custom Domain 添加域名。

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ADMIN_KEY` | 管理面板登录密钥 | `your-admin-password-here` |
| `SESSION_SECRET` | 会话签名密钥（需修改） | `pine-sub-session-secret-change-me` |

## 使用

1. 访问部署地址，输入管理密钥登录
2. 在"节点输入转换"框中粘贴节点链接/配置，点击提交
3. 在"多路订阅分发"中创建订阅通道，分配节点权限
4. 客户端使用生成的订阅链接

## 节点格式支持

- `snell://` URI
- `ss://` URI（支持 obfs 插件）
- `trojan://` URI
- `vmess://` URI（支持 JSON 标准格式和参数格式）
- Surge 标准格式（`节点名 = 协议, 地址, 端口, ...`）

## 技术栈

- Cloudflare Workers (JavaScript)
- Cloudflare KV (数据持久化)
- 原生 Web API，无外部依赖
