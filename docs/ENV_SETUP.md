# 环境变量配置指南

本文档详细说明如何配置项目所需的环境变量。

## 快速开始

### 1. 复制环境变量模板

```bash
# 在项目根目录执行
cp env.example .env
```

### 2. 编辑 `.env` 文件

根据你的实际环境修改 `.env` 文件中的配置值。

---

## 配置项详解

### 🚀 服务器配置

#### `PORT`
- **说明**: API 服务监听端口
- **默认值**: `5000`
- **Docker 环境**: `25052`
- **示例**: `PORT=25052`

#### `CORS_ORIGIN`
- **说明**: 允许跨域访问的前端地址
- **默认值**: `http://localhost:3000`
- **示例**: `CORS_ORIGIN=http://localhost:23032`
- **多个地址**: `CORS_ORIGIN=http://localhost:3000,https://app.example.com`

#### `NODE_ENV`
- **说明**: 运行环境
- **可选值**: `development` / `production` / `test`
- **默认值**: `development`
- **示例**: `NODE_ENV=production`

---

### 💾 Redis 配置

#### `REDIS_HOST`
- **说明**: Redis 服务器地址
- **本地开发**: `localhost`
- **Docker 环境**: `redis` (使用 docker-compose 时)
- **示例**: `REDIS_HOST=localhost`

#### `REDIS_PORT`
- **说明**: Redis 端口
- **默认值**: `6379`
- **示例**: `REDIS_PORT=6379`

#### `REDIS_PASSWORD`
- **说明**: Redis 密码（可选）
- **默认值**: 空（无密码）
- **示例**: `REDIS_PASSWORD=your_redis_password`
- **注意**: 生产环境建议设置密码

#### `REDIS_DB`
- **说明**: Redis 数据库索引
- **范围**: `0-15`
- **默认值**: `0`
- **示例**: `REDIS_DB=0`

**功能说明**:
- 用于存储临时 Bearer Token
- 支持自动降级到内存存储
- 生产环境建议启用持久化（AOF）

---

### 🗄️ Supabase 数据库配置

#### `SUPABASE_URL`
- **说明**: Supabase 项目 URL
- **格式**: `https://your-project-id.supabase.co`
- **获取方式**: Supabase Dashboard > Settings > API > Project URL
- **示例**: `SUPABASE_URL=https://abcdefgh.supabase.co`

#### `SUPABASE_ANON_KEY`
- **说明**: Supabase 匿名密钥（公开密钥）
- **用途**: 客户端使用，受 RLS（行级安全）保护
- **获取方式**: Supabase Dashboard > Settings > API > `anon` `public`
- **示例**: `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY`
- **说明**: Supabase 服务角色密钥（管理员密钥）
- **用途**: 后端管理操作，绕过 RLS 限制
- **获取方式**: Supabase Dashboard > Settings > API > `service_role` `secret`
- **示例**: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ 安全警告**: 
  - 此密钥具有完整数据库权限
  - 切勿在前端代码中使用
  - 切勿提交到 Git 仓库
  - 仅在服务端使用

**功能说明**:
- 用户认证和管理
- 持久化 APIKEY 存储
- 用户数据存储

---

### 🎬 第三方 API 配置 - Creatomate

#### `API_CREATOMATE_BASE_URL`
- **说明**: Creatomate API 基础地址
- **默认值**: `https://api.creatomate.com`
- **示例**: `API_CREATOMATE_BASE_URL=https://api.creatomate.com`

#### `API_CREATOMATE_VERSION`
- **说明**: API 版本号
- **默认值**: `v2`
- **示例**: `API_CREATOMATE_VERSION=v2`

#### `API_CREATOMATE_TOKEN`
- **说明**: Creatomate API 令牌
- **获取方式**: Creatomate Dashboard > API Keys
- **示例**: `API_CREATOMATE_TOKEN=52181a0602234279b5046983...`
- **注意**: 此 Token 会自动添加到请求头，用户 Token 不会转发

---

### 🤖 第三方 API 配置 - Coze

#### `API_COZE_BASE_URL`
- **说明**: Coze API 基础地址
- **默认值**: `https://api.coze.com`
- **示例**: `API_COZE_BASE_URL=https://api.coze.com`

#### `API_COZE_VERSION`
- **说明**: API 版本号
- **默认值**: `v1`
- **示例**: `API_COZE_VERSION=v1`

#### `API_COZE_TOKEN`
- **说明**: Coze API 令牌
- **获取方式**: Coze 平台获取
- **示例**: `API_COZE_TOKEN=your_coze_token`

#### `API_COZE_SIGNATURE_SECRET`
- **说明**: Webhook 签名验证密钥（可选）
- **用途**: 验证来自 Coze 的 Webhook 请求
- **示例**: `API_COZE_SIGNATURE_SECRET=your_signature_secret`

---

### 🔄 第三方 API 配置 - n8n

#### `API_N8N_BASE_URL`
- **说明**: n8n 实例地址
- **示例**: `API_N8N_BASE_URL=https://n8n.example.com`

#### `API_N8N_VERSION`
- **说明**: API 版本号
- **默认值**: `v1`
- **示例**: `API_N8N_VERSION=v1`

#### `API_N8N_TOKEN`
- **说明**: n8n API 密钥
- **获取方式**: n8n > Settings > API
- **示例**: `API_N8N_TOKEN=your_n8n_api_key`

#### `API_N8N_SIGNATURE_SECRET`
- **说明**: Webhook 签名验证密钥（可选）
- **示例**: `API_N8N_SIGNATURE_SECRET=your_signature_secret`

---

### ➕ 添加自定义第三方 API

你可以通过环境变量动态添加更多第三方 API，无需修改代码。

**配置格式**:
```env
API_{名称大写}_BASE_URL=https://api.example.com
API_{名称大写}_VERSION=v1
API_{名称大写}_TOKEN=your_token
```

**示例 1 - Stripe 支付**:
```env
API_STRIPE_BASE_URL=https://api.stripe.com
API_STRIPE_VERSION=v1
API_STRIPE_TOKEN=sk_test_xxxxx
```

**示例 2 - SendGrid 邮件**:
```env
API_SENDGRID_BASE_URL=https://api.sendgrid.com
API_SENDGRID_VERSION=v3
API_SENDGRID_TOKEN=SG.xxxxx
```

**使用方式**:
```bash
# 访问 Stripe API
GET /api/v1/proxy/stripe/charges

# 访问 SendGrid API
POST /api/v1/proxy/sendgrid/mail/send
```

---

### 🌐 Web 前端配置

#### `NEXT_PUBLIC_API_BASE`
- **说明**: 前端访问的 API 基础地址
- **本地开发**: `http://localhost:25052`
- **生产环境**: `https://api.yourdomain.com`
- **示例**: `NEXT_PUBLIC_API_BASE=http://localhost:25052`
- **注意**: `NEXT_PUBLIC_` 前缀的变量会暴露给前端

---

### 📝 日志配置（可选）

#### `LOG_LEVEL`
- **说明**: 日志级别
- **可选值**: `error` / `warn` / `info` / `debug`
- **默认值**: `info`
- **示例**: `LOG_LEVEL=debug`

#### `LOG_FILE_ENABLED`
- **说明**: 是否启用文件日志
- **默认值**: `true`
- **示例**: `LOG_FILE_ENABLED=false`

#### `LOG_FILE_PATH`
- **说明**: 日志文件存储路径
- **默认值**: `./logs`
- **示例**: `LOG_FILE_PATH=/var/log/api-balancer`

---

### 🔒 安全配置（可选）

#### `JWT_SECRET`
- **说明**: JWT 签名密钥（如果使用 JWT）
- **生成方式**: `openssl rand -hex 32`
- **示例**: `JWT_SECRET=a1b2c3d4e5f6...`
- **注意**: 生产环境务必使用强随机字符串

#### `API_KEY_EXPIRATION`
- **说明**: API Key 过期时间（小时）
- **默认值**: `24`
- **示例**: `API_KEY_EXPIRATION=72`

#### `BCRYPT_ROUNDS`
- **说明**: 密码加密盐轮数
- **默认值**: `10`
- **示例**: `BCRYPT_ROUNDS=12`
- **注意**: 数值越大越安全，但性能开销越大

---

### 🛠️ 开发工具配置（可选）

#### `DEBUG`
- **说明**: 是否启用调试模式
- **默认值**: `false`
- **示例**: `DEBUG=true`

#### `API_VERBOSE_LOGGING`
- **说明**: 是否启用 API 详细日志
- **默认值**: `true`
- **示例**: `API_VERBOSE_LOGGING=false`

#### `SQL_LOGGING`
- **说明**: 是否启用 SQL 查询日志
- **默认值**: `false`
- **示例**: `SQL_LOGGING=true`

---

## 环境区分

### 开发环境 (`.env`)

```env
NODE_ENV=development
PORT=25052
REDIS_HOST=localhost
DEBUG=true
API_VERBOSE_LOGGING=true
```

### 生产环境 (`.env.production`)

```env
NODE_ENV=production
PORT=25052
REDIS_HOST=redis
REDIS_PASSWORD=strong_password_here
DEBUG=false
API_VERBOSE_LOGGING=false
```

### Docker 环境

Docker Compose 会自动从 `.env` 文件读取环境变量，但某些值会被 `docker-compose.yml` 覆盖：

```yaml
environment:
  - REDIS_HOST=redis  # 覆盖 .env 中的值
  - REDIS_PORT=6379
```

---

## 安全最佳实践

### ✅ 必须做的

1. **不要提交 `.env` 文件到 Git**
   ```bash
   # 确保 .gitignore 包含
   .env
   .env.local
   .env.*.local
   ```

2. **使用强密码和随机密钥**
   ```bash
   # 生成随机密钥
   openssl rand -hex 32
   ```

3. **区分环境使用不同的密钥**
   - 开发环境: `.env`
   - 测试环境: `.env.test`
   - 生产环境: 使用环境变量管理服务

4. **定期轮换密钥**
   - API Token 每 3-6 个月更换一次
   - 数据库密码每年更换一次

### ❌ 不要做的

1. ❌ 不要在代码中硬编码密钥
2. ❌ 不要在日志中输出完整的 Token
3. ❌ 不要在前端代码中使用 `SUPABASE_SERVICE_ROLE_KEY`
4. ❌ 不要共享生产环境的 `.env` 文件

---

## 故障排查

### Redis 连接失败

**问题**: `Redis连接错误: connect ECONNREFUSED`

**解决方案**:
1. 检查 Redis 是否运行: `redis-cli ping`
2. 检查 `REDIS_HOST` 和 `REDIS_PORT` 配置
3. 如果使用密码，检查 `REDIS_PASSWORD` 是否正确

### Supabase 配置错误

**问题**: `警告: Supabase配置未设置`

**解决方案**:
1. 确认 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 已配置
2. 检查密钥格式是否正确（JWT 格式）
3. 访问 Supabase Dashboard 重新获取密钥

### 第三方 API 代理失败

**问题**: `API配置不存在: xxx`

**解决方案**:
1. 检查环境变量命名是否正确（大写，使用下划线）
2. 确认 `API_{NAME}_BASE_URL` 已配置
3. 重启服务使环境变量生效

### 环境变量未生效

**问题**: 修改 `.env` 后配置未更新

**解决方案**:
1. **重启服务**: 环境变量在服务启动时加载
   ```bash
   # 停止服务
   Ctrl + C
   
   # 重新启动
   pnpm dev
   ```

2. **Docker 环境**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 验证配置

创建一个简单的脚本验证环境变量是否正确加载：

```javascript
// verify-env.js
require('dotenv').config();

console.log('✅ 环境变量验证\n');

const required = [
  'PORT',
  'REDIS_HOST',
  'REDIS_PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const optional = [
  'REDIS_PASSWORD',
  'SUPABASE_SERVICE_ROLE_KEY',
  'API_CREATOMATE_TOKEN',
];

console.log('📌 必需配置:');
required.forEach(key => {
  const value = process.env[key];
  const status = value ? '✓' : '✗';
  const display = value ? (value.length > 20 ? value.slice(0, 20) + '...' : value) : '未配置';
  console.log(`  ${status} ${key}: ${display}`);
});

console.log('\n📋 可选配置:');
optional.forEach(key => {
  const value = process.env[key];
  const status = value ? '✓' : '-';
  const display = value ? (value.length > 20 ? value.slice(0, 20) + '...' : value) : '未配置';
  console.log(`  ${status} ${key}: ${display}`);
});
```

运行验证:
```bash
node verify-env.js
```

---

## 参考链接

- [Supabase 文档](https://supabase.com/docs)
- [Redis 文档](https://redis.io/docs/)
- [Docker Compose 环境变量](https://docs.docker.com/compose/environment-variables/)
- [Node.js dotenv 文档](https://github.com/motdotla/dotenv)

---

**最后更新**: 2026-01-22

