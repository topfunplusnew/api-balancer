# Express Starter API Agent 使用指南

本文档为 AI Agent 提供使用本系统 API 的完整指南。

## 目录

- [系统概述](#系统概述)
- [快速开始](#快速开始)
- [鉴权方式](#鉴权方式)
- [API 接口](#api-接口)
- [代理服务](#代理服务)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## 系统概述

Express Starter 是一个基于 Express.js 的 API 服务框架，提供以下核心功能：

1. **统一鉴权系统** - 支持临时 Token 和持久化 APIKEY 两种鉴权方式
2. **API 代理服务** - 统一代理第三方 API，使用固定 Token 进行鉴权
3. **用户管理** - 基于 Supabase 的用户认证和管理
4. **Redis 缓存** - 临时 Token 存储在 Redis 中，支持持久化

### 基础信息

- **基础 URL**: `http://localhost:5000/api/v1` (开发环境)
- **Swagger UI**: `http://localhost:5000/api-docs`
- **API 版本**: v1

## 快速开始

### 1. 获取临时 Token（Bearer Token）

```bash
POST /api/v1/auth/api-key
# 或便捷路径
POST /auth/api-key

Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "access_key": "admin_1234567890_abcdef1234567890",
    "message": "API key已生成，请使用access_key作为Bearer token进行鉴权"
  }
}
```

### 2. 使用 Token 访问 API

```bash
GET /api/v1/info
Authorization: Bearer {access_key}
```

## 鉴权方式

系统支持两种鉴权方式，按优先级顺序：

### 1. Bearer Token（临时 Token）

**特点**:
- 通过 `/auth/api-key` 接口获取
- 存储在 Redis 中（如果可用）或内存中
- 默认 24 小时过期
- 服务重启后可能失效（如果使用内存存储）

**使用方式**:
```bash
Authorization: Bearer {access_key}
```

**获取方式**:
```bash
POST /api/v1/auth/api-key
{
  "username": "your_username",
  "password": "your_password"
}
```

### 2. APIKEY（持久化 Key）

**特点**:
- 通过 `/api-keys` 接口创建
- 存储在数据库中，服务重启后仍然有效
- 支持过期时间设置和启用/禁用
- 格式：`sk_` 前缀 + 64 位十六进制字符串

**使用方式**:
```bash
# 方式1: 请求头
X-API-Key: sk_xxxxxxxxxxxxx

# 方式2: 查询参数
?api_key=sk_xxxxxxxxxxxxx
```

**创建方式**:
```bash
POST /api/v1/api-keys
Authorization: Bearer {temporary_token}

{
  "name": "My API Key",
  "expires_at": "2026-12-31T23:59:59Z"  # 可选
}
```

## API 接口

### 系统信息

#### 获取系统信息
```http
GET /api/v1/info
```

**响应**:
```json
{
  "success": true,
  "message": "API is live",
  "data": {},
  "error": {}
}
```

### 鉴权接口

#### 获取临时 Token
```http
POST /api/v1/auth/api-key
POST /auth/api-key  # 便捷路径
```

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "access_key": "string",
    "message": "string"
  }
}
```

### APIKEY 管理接口

所有 APIKEY 管理接口都需要先通过 Bearer Token 鉴权。

#### 创建持久化 APIKEY
```http
POST /api/v1/api-keys
POST /api-keys  # 便捷路径
Authorization: Bearer {token}
```

**请求体**（可选）:
```json
{
  "name": "My Production API Key",
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "api_key": "sk_xxxxxxxxxxxxx",
    "name": "string",
    "created_at": "2026-01-17T12:00:00Z",
    "expires_at": null,
    "message": "APIKEY 已生成，请妥善保管，此密钥只会显示一次"
  }
}
```

#### 获取 APIKEY 列表
```http
GET /api/v1/api-keys
GET /api-keys  # 便捷路径
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "api_key": "sk_1234...abcd",
      "name": "string",
      "is_active": true,
      "last_used_at": "2026-01-17T12:30:00Z",
      "expires_at": null,
      "created_at": "2026-01-17T12:00:00Z"
    }
  ]
}
```

#### 删除 APIKEY
```http
DELETE /api/v1/api-keys/{id}
DELETE /api-keys/{id}  # 便捷路径
Authorization: Bearer {token}
```

#### 启用/禁用 APIKEY
```http
PATCH /api/v1/api-keys/{id}/toggle
PATCH /api-keys/{id}/toggle  # 便捷路径
Authorization: Bearer {token}

{
  "is_active": false
}
```

## 代理服务

系统提供统一的 API 代理服务，用于转发请求到第三方 API。

### 重要说明

1. **用户 Token 不转发**: 用户的 Bearer Token 或 APIKEY 只用于访问本系统的代理接口，**不会**转发给第三方 API
2. **使用固定 Token**: 系统使用 `.env` 中配置的固定 Token 来请求第三方 API
3. **自动鉴权**: 系统会自动添加配置的 Token 到请求头

### Creatomate API 代理

```http
GET /api/v1/proxy/creatomate/{path}
POST /api/v1/proxy/creatomate/{path}
PUT /api/v1/proxy/creatomate/{path}
PATCH /api/v1/proxy/creatomate/{path}
DELETE /api/v1/proxy/creatomate/{path}

Authorization: Bearer {your_token}
# 或
X-API-Key: {your_api_key}
```

**示例**:
```bash
GET /api/v1/proxy/creatomate/renders?page=1&limit=10
Authorization: Bearer {your_token}
```

### 通用 API 代理

支持动态配置的第三方 API：

```http
GET /api/v1/proxy/{apiName}/{path}
POST /api/v1/proxy/{apiName}/{path}
PUT /api/v1/proxy/{apiName}/{path}
PATCH /api/v1/proxy/{apiName}/{path}
DELETE /api/v1/proxy/{apiName}/{path}

Authorization: Bearer {your_token}
```

**配置要求**:
在 `.env` 文件中配置：
```env
API_{API_NAME}_BASE_URL=https://api.example.com
API_{API_NAME}_VERSION=v1
API_{API_NAME}_TOKEN=your_api_token
```

**示例**:
```bash
# 假设配置了 API_MYAPI_BASE_URL
GET /api/v1/proxy/myapi/users/123
Authorization: Bearer {your_token}
```

## 错误处理

### 标准错误响应格式

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    // 错误详情
  }
}
```

### 常见错误码

| 状态码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求体格式和必填字段 |
| 401 | 鉴权失败 | 检查 Token 是否有效或已过期 |
| 404 | 资源不存在 | 检查 API 路径是否正确 |
| 500 | 服务器内部错误 | 查看服务器日志 |

### 错误示例

**鉴权失败**:
```json
{
  "success": false,
  "message": "鉴权失败，请提供有效的 Bearer Token 或 APIKEY",
  "error": {}
}
```

**API 配置不存在**:
```json
{
  "success": false,
  "message": "API配置不存在: nonexistent",
  "error": {}
}
```

## 最佳实践

### 1. Token 管理

- **开发环境**: 使用临时 Bearer Token
- **生产环境**: 使用持久化 APIKEY
- **安全**: 不要在代码中硬编码 Token，使用环境变量

### 2. 代理服务使用

- **统一入口**: 所有第三方 API 请求都通过本系统代理
- **Token 隔离**: 用户的 Token 不会泄露给第三方 API
- **配置管理**: 第三方 API 的 Token 统一在 `.env` 中配置

### 3. 错误处理

- **重试机制**: 对于临时错误（如网络问题），实现重试逻辑
- **日志记录**: 记录所有 API 调用和错误信息
- **优雅降级**: 当 Redis 不可用时，系统会自动回退到内存存储

### 4. 性能优化

- **Token 缓存**: 临时 Token 存储在 Redis 中，提高验证速度
- **连接复用**: 使用连接池管理数据库和 Redis 连接
- **请求超时**: 设置合理的请求超时时间

## 完整示例

### 示例 1: 使用临时 Token 访问代理服务

```bash
# 1. 获取临时 Token
curl -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

# 响应: {"success":true,"data":{"access_key":"admin_xxx..."}}

# 2. 使用 Token 访问代理服务
curl -X GET "http://localhost:5000/api/v1/proxy/creatomate/renders?page=1&limit=10" \
     -H "Authorization: Bearer admin_xxx..."
```

### 示例 2: 创建并使用持久化 APIKEY

```bash
# 1. 获取临时 Token
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}' \
     | jq -r '.data.access_key')

# 2. 创建持久化 APIKEY
API_KEY=$(curl -s -X POST http://localhost:5000/api/v1/api-keys \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Production Key"}' \
     | jq -r '.data.api_key')

# 3. 使用 APIKEY 访问代理服务
curl -X GET "http://localhost:5000/api/v1/proxy/creatomate/renders" \
     -H "X-API-Key: $API_KEY"
```

### 示例 3: 使用查询参数传递 APIKEY

```bash
curl -X GET "http://localhost:5000/api/v1/proxy/creatomate/renders?api_key=sk_xxxxxxxxxxxxx"
```

## 环境变量配置

### 必需配置

```env
# 服务器配置
PORT=5000

# Redis配置（可选，如果未配置则使用内存存储）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Supabase配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 第三方 API 配置

```env
# Creatomate API 示例
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2
API_CREATOMATE_TOKEN=your_creatomate_token

# 其他 API 配置格式
API_{NAME}_BASE_URL=https://api.example.com
API_{NAME}_VERSION=v1
API_{NAME}_TOKEN=your_api_token
```

## 注意事项

1. **Token 安全**: 
   - 临时 Token 存储在 Redis 中，默认 24 小时过期
   - 持久化 APIKEY 创建后只显示一次，请妥善保管
   - 不要在日志中输出完整的 Token

2. **代理服务**:
   - 用户的 Token 不会转发给第三方 API
   - 第三方 API 的 Token 在 `.env` 中配置
   - 确保第三方 API 的 Token 有足够的权限

3. **Redis 可用性**:
   - 如果 Redis 不可用，系统会自动回退到内存存储
   - 内存存储的 Token 在服务重启后会丢失
   - 生产环境建议使用 Redis

4. **路径格式**:
   - 所有接口都支持两种路径格式：完整路径和便捷路径
   - 完整路径：`/api/v1/{path}`
   - 便捷路径：`/{path}`

## 技术支持

- **Swagger UI**: 访问 `http://localhost:5000/api-docs` 查看完整的 API 文档
- **项目文档**: 查看 `docs/` 目录下的详细文档
- **问题反馈**: 通过 GitHub Issues 提交问题

## 更新日志

### v1.0.0
- ✅ 统一鉴权系统（Bearer Token + APIKEY）
- ✅ API 代理服务
- ✅ Redis 集成
- ✅ Supabase 数据库集成
- ✅ Docker Compose 支持

---

**最后更新**: 2026-01-17
