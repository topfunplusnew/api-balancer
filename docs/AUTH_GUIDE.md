# API鉴权系统使用指南

本文档说明如何使用项目中的API鉴权系统。

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [初始化用户](#初始化用户)
- [获取API Key](#获取api-key)
- [使用API Key](#使用api-key)
- [API参考](#api参考)
- [常见问题](#常见问题)

## 概述

API鉴权系统提供了基于API Key的统一鉴权机制，使用Supabase数据库存储用户信息：

1. **配置Supabase**：设置Supabase数据库连接
2. **初始化用户**：创建系统用户（用户名和密码）
3. **获取API Key**：通过提供用户名和密码进行用户鉴权，验证成功后生成API Key
4. **使用API Key**：在请求头中使用 `Authorization: Bearer {access_key}` 进行鉴权
5. **自动验证**：所有需要鉴权的路由会自动验证API Key的有效性

## 快速开始

### 1. 配置Supabase

在 `.env` 文件中配置Supabase连接：

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

详细配置说明请参考 [Supabase数据库集成指南](./SUPABASE_SETUP.md)

### 2. 创建数据库表

在Supabase SQL Editor中执行 `migrations/001_create_users_table.sql` 创建用户表。

### 3. 初始化用户

创建系统用户：

```bash
# 使用默认用户名和密码（admin/admin123）
pnpm init-user

# 或指定用户名和密码
pnpm init-user myuser mypassword
```

### 4. 获取API Key

```bash
curl -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{
  "username": "admin",
  "password": "admin123"
}'
```

### 5. 使用API Key访问受保护的路由

```bash
curl -X GET http://localhost:5000/api/v1/proxy/creatomate/renders \
     -H "Authorization: Bearer {your_access_key}"
```

## 初始化用户

在使用API之前，需要先创建系统用户。

### 使用脚本初始化

```bash
# 使用默认用户名和密码（admin/admin123）
pnpm init-user

# 指定用户名和密码
pnpm init-user myuser mypassword
```

### 程序化创建用户

也可以通过代码创建用户：

```javascript
const { AuthService } = require("./services");

// 创建用户
const user = AuthService.createUser("username", "password");
```

**注意：**
- 用户信息存储在内存中，服务器重启后会丢失
- 生产环境建议使用数据库存储用户信息
- 密码使用SHA256加密存储

## 获取API Key

### 请求

**端点：** `POST /api/v1/auth/api-key`

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

**字段说明：**
- `username`：用户名（必填）
- `password`：密码（必填）

### 响应

**成功响应（200）：**
```json
{
  "success": true,
  "data": {
    "access_key": "admin_1234567890_abcdef1234567890",
    "message": "API key已生成，请使用access_key作为Bearer token进行鉴权"
  }
}
```

**错误响应：**

缺少必填字段（400）：
```json
{
  "success": false,
  "message": "缺少必填字段: username 和 password",
  "error": {}
}
```

用户名或密码错误（401）：
```json
{
  "success": false,
  "message": "用户名或密码错误",
  "error": {}
}
```

### 示例

**使用REST Client：**
```http
POST http://localhost:5000/api/v1/auth/api-key
Content-Type: application/json

{
  "secret_key": "your_secret_key",
  "order_token": "your_order_token"
}
```

**使用curl：**
```bash
curl -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{
  "username": "admin",
  "password": "admin123"
}'
```

## 使用API Key

### 请求头格式

所有需要鉴权的请求必须在请求头中包含：

```
Authorization: Bearer {access_key}
```

其中 `{access_key}` 是获取API Key时返回的 `access_key` 值。

### 受保护的路由

以下路由需要API Key鉴权：

- `POST /api/v1/proxy/creatomate/:path(*)`
- `GET /api/v1/proxy/creatomate/:path(*)`
- `ALL /api/v1/proxy/:apiName/:path(*)`

### 示例

**使用REST Client：**
```http
GET http://localhost:5000/api/v1/proxy/creatomate/renders
Authorization: Bearer your_access_key
```

**使用curl：**
```bash
curl -X GET http://localhost:5000/api/v1/proxy/creatomate/renders \
     -H "Authorization: Bearer your_access_key"
```

### 鉴权失败响应

**缺少Authorization请求头（401）：**
```json
{
  "success": false,
  "message": "缺少Authorization请求头",
  "error": {}
}
```

**格式错误（401）：**
```json
{
  "success": false,
  "message": "Authorization格式错误，应为: Bearer {access_key}",
  "error": {}
}
```

**无效的API Key（401）：**
```json
{
  "success": false,
  "message": "无效的API key",
  "error": {}
}
```

## 用户管理

### 创建用户

**方式一：使用脚本**
```bash
pnpm init-user [username] [password]
```

**方式二：程序化创建**
```javascript
const { AuthService } = require("./services");

try {
  const user = AuthService.createUser("username", "password");
  console.log("用户创建成功:", user);
} catch (error) {
  if (error.statusCode === 409) {
    console.log("用户已存在");
  }
}
```

### 用户存储

- 用户信息存储在Supabase数据库中（`src/utils/user-store.js`）
- 密码使用SHA256加密存储
- 数据持久化，服务器重启后数据不会丢失
- 支持Row Level Security (RLS)进行数据安全控制

### 密码安全

- 密码使用SHA256单向加密
- 明文密码不会存储在系统中
- 建议使用强密码策略

## API参考

### 获取API Key

**端点：** `POST /api/v1/auth/api-key`

**鉴权：** 不需要

**请求体：**
```typescript
{
  username: string;      // 必填
  password: string;      // 必填
}
```

**响应：**
```typescript
{
  success: boolean;
  data?: {
    access_key: string;
    message: string;
  };
  message?: string;
  error?: object;
}
```

## 常见问题

### 1. 如何获取API Key？

首先需要初始化用户（`pnpm init-user`），然后调用 `POST /api/v1/auth/api-key` 接口，提供 `username` 和 `password` 即可获取API Key。

### 2. API Key的有效期是多久？

API Key存储在内存中，服务器重启后会失效。用户信息存储在Supabase数据库中，服务器重启后用户数据不会丢失，但需要重新获取API Key。

### 3. 如何撤销API Key？

目前API Key存储在内存中，服务器重启后会自动清除。如果需要主动撤销，可以调用 `apiKeyStore.delete(accessKey)` 方法（需要实现管理接口）。

### 4. 为什么获取API Key后仍然无法访问？

可能的原因：
- API Key格式错误（应该是 `Bearer {access_key}`）
- API Key已失效（服务器重启后需要重新获取）
- 请求头格式错误

### 5. 如何查看当前存储的用户？

用户信息存储在Supabase数据库中，可以通过Supabase Dashboard的Table Editor查看和管理用户数据。

### 6. 如何创建新用户？

使用初始化脚本：`pnpm init-user [username] [password]`

或通过代码创建：
```javascript
const { AuthService } = require("./services");
AuthService.createUser("username", "password");
```

### 7. 可以在多个服务器实例间共享用户数据吗？

用户数据存储在Supabase数据库中，多个服务器实例可以共享同一数据库，实现用户数据的统一管理。

## 安全建议

1. **不要在生产环境返回secret_key**
   - 当前实现为了便于测试返回了 `secret_key`，生产环境应该只返回 `access_key`

2. **使用HTTPS**
   - 确保API Key传输安全，使用HTTPS协议

3. **定期轮换API Key**
   - 定期更新API Key以提高安全性

4. **限制API Key权限**
   - 根据业务需求限制API Key的访问权限

5. **监控异常访问**
   - 记录无效API Key的访问尝试，及时发现安全问题

## 相关文件

- 鉴权服务：`src/services/auth-service.js`
- 鉴权控制器：`src/controllers/auth-controller.js`
- 鉴权中间件：`src/middlewares/auth-middleware.js`
- API Key存储：`src/utils/api-key-store.js`
- 用户存储：`src/utils/user-store.js`
- 初始化脚本：`src/scripts/init-user.js`
- 路由配置：`src/routes/v1/index.js`
- 测试文件：`src/test/auth-*.test.js`

## 更新日志

- 2024-01-17：初始版本，支持基于API Key的统一鉴权
