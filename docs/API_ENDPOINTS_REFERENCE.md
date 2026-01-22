# API 接口速查表

本文档提供所有可用 API 接口的快速参考。

## 🔴 常见错误

### ❌ 错误的请求路径

```bash
# 错误：缺少 /proxy/creatomate 前缀
GET /api/v1/templates  ❌ 404 Not Found

# 正确：完整的代理路径
GET /api/v1/proxy/creatomate/templates  ✅
```

---

## 📍 系统接口

### 健康检查

```bash
GET /api/v1/info
# 不需要鉴权
```

### 模板配置

```bash
GET /api/v1/template-config
# 不需要鉴权
```

---

## 🔐 鉴权接口

### 获取临时 Token

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

### 创建持久化 APIKEY

```bash
POST /api/v1/api-keys
# 或便捷路径
POST /api-keys

Authorization: Bearer YOUR_TEMP_TOKEN
Content-Type: application/json
{
  "name": "My API Key"
}
```

---

## 🎬 Creatomate API 代理

**重要**: 所有 Creatomate 接口都需要 `/proxy/creatomate` 前缀！

### 1. 获取模板列表

```bash
GET /api/v1/proxy/creatomate/templates
Authorization: Bearer YOUR_TOKEN

# 实际转发到
GET https://api.creatomate.com/v1/templates
```

### 2. 获取渲染列表

```bash
GET /api/v1/proxy/creatomate/renders?page=1&limit=10
Authorization: Bearer YOUR_TOKEN

# 实际转发到
GET https://api.creatomate.com/v1/renders?page=1&limit=10
```

### 3. 创建渲染任务

```bash
POST /api/v1/proxy/creatomate/renders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "template_id": "xxx",
  "modifications": {...}
}

# 实际转发到
POST https://api.creatomate.com/v1/renders
```

### 4. 获取渲染详情

```bash
GET /api/v1/proxy/creatomate/renders/{renderId}
Authorization: Bearer YOUR_TOKEN

# 实际转发到
GET https://api.creatomate.com/v1/renders/{renderId}
```

### 5. 通用代理（支持任意路径）

```bash
{METHOD} /api/v1/proxy/creatomate/{任意路径}
Authorization: Bearer YOUR_TOKEN

# 实际转发到
{METHOD} https://api.creatomate.com/v1/{任意路径}
```

---

## 🤖 其他第三方 API 代理

### Coze API

```bash
{METHOD} /api/v1/proxy/coze/{path}
Authorization: Bearer YOUR_TOKEN

# 实际转发到
{METHOD} https://api.coze.com/v1/{path}
```

### n8n API

```bash
{METHOD} /api/v1/proxy/n8n/{path}
Authorization: Bearer YOUR_TOKEN

# 实际转发到
{METHOD} https://n8n.example.com/v1/{path}
```

### 通用代理

```bash
{METHOD} /api/v1/proxy/{apiName}/{path}
Authorization: Bearer YOUR_TOKEN

# 需要在 .env 中配置
API_{APINAME}_BASE_URL=https://api.example.com
API_{APINAME}_VERSION=v1
API_{APINAME}_TOKEN=your_token
```

---

## 🎯 URL 结构说明

### 代理接口的 URL 组成

```
完整URL = 基础地址 + 版本 + 代理前缀 + API名称 + 路径

示例：
http://localhost:25052/api/v1/proxy/creatomate/templates
│                    │  │   │  │     │          │
│                    │  │   │  │     │          └─ 目标API路径
│                    │  │   │  │     └─ API名称（creatomate）
│                    │  │   │  └─ 代理标识
│                    │  │   └─ 系统版本（v1）
│                    │  └─ 系统API前缀
│                    └─ 服务地址
```

### 转发规则

```
用户请求:
GET /api/v1/proxy/creatomate/templates

系统处理:
1. 识别 API 名称: creatomate
2. 从配置读取: 
   - BASE_URL: https://api.creatomate.com
   - VERSION: v1
   - TOKEN: your_token
3. 构建目标URL: 
   https://api.creatomate.com/v1/templates
4. 添加鉴权: Authorization: Bearer your_token
5. 转发请求
```

---

## 📝 完整示例

### 示例 1: 获取 Creatomate 模板列表

```bash
# 步骤 1: 获取临时 Token
curl -X POST http://localhost:25052/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

# 响应:
# {
#   "success": true,
#   "data": {
#     "access_key": "admin_1234567890_abcdef"
#   }
# }

# 步骤 2: 使用 Token 获取模板列表
curl -X GET http://localhost:25052/api/v1/proxy/creatomate/templates \
     -H "Authorization: Bearer admin_1234567890_abcdef"

# 响应:
# {
#   "success": true,
#   "message": "获取模板列表成功",
#   "data": [
#     {
#       "id": "xxx",
#       "name": "My Template",
#       "tags": [],
#       "created_at": "...",
#       "updated_at": "..."
#     }
#   ]
# }
```

### 示例 2: 创建渲染任务

```bash
curl -X POST http://localhost:25052/api/v1/proxy/creatomate/renders \
     -H "Authorization: Bearer admin_1234567890_abcdef" \
     -H "Content-Type: application/json" \
     -d '{
       "template_id": "c937d125-b99b-4690-96f0-6aa1f09438c9",
       "modifications": {
         "Text-1": "Hello World"
       }
     }'
```

---

## 🔍 调试技巧

### 查看详细日志

启动服务后，控制台会显示每个代理请求的详细信息：

```
================================================================================
[Proxy] API代理请求 - CREATOMATE
================================================================================
[Proxy] >>> 请求方法: GET
[Proxy] >>> 目标地址: https://api.creatomate.com/v1/templates
[Proxy] >>> 原始路径: templates
[Proxy] >>> 请求头: {
  "Content-Type": "application/json",
  "Authorization": "Bearer 52181a06022342..."
}
================================================================================
[Proxy] <<< 响应状态: 200 OK
[Proxy] <<< 响应数据:
[...]
================================================================================
```

### 常见问题排查

#### 404 Not Found

```bash
# 检查路径是否包含 /proxy/{apiName}
错误: /api/v1/templates
正确: /api/v1/proxy/creatomate/templates
```

#### 401 Unauthorized

```bash
# 检查 Token 是否有效
curl -X GET http://localhost:25052/api/v1/api-keys \
     -H "Authorization: Bearer YOUR_TOKEN"
```

#### API配置不存在

```bash
# 检查 .env 配置
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2
API_CREATOMATE_TOKEN=your_token

# 重启服务
pnpm dev
```

---

## 📚 相关文档

- [Creatomate API 详细指南](./CREATOMATE_API_GUIDE.md)
- [鉴权系统使用指南](./AUTH_GUIDE.md)
- [API 代理服务指南](./API_PROXY_GUIDE.md)
- [环境变量配置指南](./ENV_SETUP.md)

---

**最后更新**: 2026-01-22

