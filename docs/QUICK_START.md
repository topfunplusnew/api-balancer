# 快速开始指南

本指南帮助你快速启动项目并使用所有功能。

## 前置要求

- Node.js (推荐 v18+)
- pnpm (或其他包管理器)
- Supabase账号（用于数据库）

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 服务器配置
PORT=5000

# Creatomate API配置
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2

# Supabase配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 设置Supabase数据库

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目或使用现有项目
3. 进入 SQL Editor
4. 执行 `migrations/001_create_users_table.sql` 创建用户表

### 4. 初始化用户

```bash
# 使用默认用户名和密码（admin/admin123）
pnpm init-user

# 或指定用户名和密码
pnpm init-user myuser mypassword
```

### 5. 启动服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:5000` 启动。

## 使用流程

### 1. 获取API Key

```bash
curl -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{
  "username": "admin",
  "password": "admin123"
}'
```

响应示例：
```json
{
  "success": true,
  "data": {
    "access_key": "admin_1234567890_abcdef1234567890",
    "message": "API key已生成，请使用access_key作为Bearer token进行鉴权"
  }
}
```

### 2. 使用API Key访问代理接口

```bash
curl -X POST http://localhost:5000/api/v1/proxy/creatomate/renders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer admin_1234567890_abcdef1234567890" \
     -d '{
  "output_format": "mp4",
  "width": 1280,
  "height": 720,
  "duration": 3,
  "elements": [
    {
      "type": "text",
      "text": "Hello World",
      "fill_color": "#ff0000"
    }
  ]
}'
```

## 查看API文档

启动服务器后，访问 Swagger UI：

```
http://localhost:5000/api-docs
```

## 测试

运行所有测试：

```bash
pnpm test
```

## 常见问题

### Supabase连接失败

确保：
- `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 已正确配置
- 数据库表已创建（执行迁移脚本）
- 网络连接正常

### 用户创建失败

检查：
- Supabase配置是否正确
- 数据库表是否存在
- 查看服务器日志了解详细错误

### API Key无效

- 确认API Key格式正确：`Authorization: Bearer {access_key}`
- 确认API Key已通过 `/auth/api-key` 接口获取
- 服务器重启后需要重新获取API Key

## 下一步

- 阅读 [API鉴权系统使用指南](./AUTH_GUIDE.md) 了解详细鉴权机制
- 阅读 [Supabase数据库集成指南](./SUPABASE_SETUP.md) 了解数据库配置
- 阅读 [第三方API代理服务使用指南](./API_PROXY_GUIDE.md) 了解如何添加更多API
