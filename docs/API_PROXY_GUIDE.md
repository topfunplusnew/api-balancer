# 第三方API代理服务使用指南

本文档说明如何在项目中添加和配置第三方API代理服务。

## 目录

- [快速开始](#快速开始)
- [配置步骤](#配置步骤)
- [使用方式](#使用方式)
- [示例](#示例)
- [常见问题](#常见问题)

## 快速开始

代理服务允许你将请求转发到外部API，无需修改客户端代码。所有配置通过环境变量管理，支持动态添加多个API。

## 配置步骤

### 1. 添加环境变量配置

在项目根目录的 `.env` 文件中添加API配置，格式如下：

```bash
# API配置格式
API_{API_NAME}_BASE_URL=https://api.example.com
API_{API_NAME}_VERSION=v1
```

**配置说明：**
- `{API_NAME}` 使用大写字母和下划线，例如：`MY_API`、`PAYMENT_SERVICE`
- `BASE_URL` 是API的基础地址（不包含版本号）
- `VERSION` 是API版本号（可选，如果不设置则不会在URL中添加版本）

**示例：**

```bash
# Creatomate API
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2

# 支付服务API（无版本号）
API_PAYMENT_BASE_URL=https://api.payment.com
# 不设置 VERSION 表示不使用版本号

# 用户服务API
API_USER_SERVICE_BASE_URL=https://api.user.com
API_USER_SERVICE_VERSION=v1
```

### 2. 重启服务器

配置完成后，需要重启服务器使配置生效：

```bash
pnpm dev
```

## 使用方式

### 方式一：专用路由（推荐）

如果API有固定的名称，可以使用专用路由：

```
{HTTP_METHOD} /api/v1/proxy/{api_name}/{path}
```

**示例：**
```bash
# Creatomate API
POST /api/v1/proxy/creatomate/renders
GET /api/v1/proxy/creatomate/renders/{render_id}

# Coze API
POST /api/v1/proxy/coze/{path}
GET /api/v1/proxy/coze/{path}

# n8n API
POST /api/v1/proxy/n8n/{path}
GET /api/v1/proxy/n8n/{path}

# 支付服务API
POST /api/v1/proxy/payment/charges
GET /api/v1/proxy/payment/charges/{charge_id}
```

### 方式二：通用路由

使用动态API名称的通用路由：

```
{HTTP_METHOD} /api/v1/proxy/{api_name}/{path}
```

**示例：**
```bash
POST /api/v1/proxy/user_service/users
GET /api/v1/proxy/user_service/users/{user_id}
```

**注意：** `api_name` 必须与 `.env` 文件中的配置名称匹配（不区分大小写，会自动转换为小写）。

## 示例

### 示例1：Creatomate API - 创建视频渲染

**环境变量配置：**
```bash
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2
```

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/v1/proxy/creatomate/renders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
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

**REST Client格式：**
```http
POST http://localhost:5000/api/v1/proxy/creatomate/renders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
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
}
```

### 示例2：支付服务API - 创建支付

**环境变量配置：**
```bash
API_PAYMENT_BASE_URL=https://api.payment.com
# 注意：没有设置 VERSION，URL中不会包含版本号
```

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/v1/proxy/payment/charges \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{
  "amount": 1000,
  "currency": "usd",
  "description": "Test payment"
}'
```

**实际转发到的URL：**
```
POST https://api.payment.com/charges
```

### 示例3：用户服务API - 获取用户信息

**环境变量配置：**
```bash
API_USER_SERVICE_BASE_URL=https://api.user.com
API_USER_SERVICE_VERSION=v1
```

**请求示例：**
```bash
curl -X GET http://localhost:5000/api/v1/proxy/user_service/users/123 \
     -H "Authorization: Bearer YOUR_API_KEY"
```

**实际转发到的URL：**
```
GET https://api.user.com/v1/users/123
```

### 示例4：Coze API - 代理请求

**环境变量配置：**
```bash
API_COZE_BASE_URL=https://api.coze.com
API_COZE_VERSION=v1
```

**请求示例：**
```bash
curl -X GET http://localhost:5000/api/v1/proxy/coze/{path} \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### 示例5：n8n API - 代理请求

**环境变量配置：**
```bash
API_N8N_BASE_URL=https://n8n.example.com
API_N8N_VERSION=api/v1
```

**请求示例：**
```bash
curl -X GET http://localhost:5000/api/v1/proxy/n8n/{path} \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## URL构建规则

代理服务会根据配置自动构建目标URL，规则如下：

1. **基础URL**：从 `API_{NAME}_BASE_URL` 获取
2. **版本号**：如果设置了 `API_{NAME}_VERSION`，会在URL中添加版本号
3. **路径**：请求中的 `{path}` 参数会追加到基础URL后

**URL构建示例：**

| 配置 | 请求路径 | 实际转发URL |
|------|---------|------------|
| `BASE_URL=https://api.example.com`<br>`VERSION=v1` | `users/123` | `https://api.example.com/v1/users/123` |
| `BASE_URL=https://api.example.com`<br>`VERSION=v1` | `/users/123` | `https://api.example.com/v1/users/123` |
| `BASE_URL=https://api.example.com`<br>无VERSION | `users/123` | `https://api.example.com/users/123` |
| `BASE_URL=https://api.example.com/`<br>`VERSION=v1` | `users/123` | `https://api.example.com/v1/users/123` |

**注意：**
- 基础URL末尾的斜杠会被自动清理
- 路径开头的斜杠会被自动清理
- 版本号会自动添加斜杠分隔

## 请求转发规则

### 支持的HTTP方法

代理服务支持所有HTTP方法：
- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `HEAD`
- `OPTIONS`

### 请求头转发

以下请求头会被自动转发：
- `Authorization` - 认证令牌
- `Content-Type` - 内容类型（默认为 `application/json`）
- 其他自定义请求头

**注意：** 代理服务会自动设置 `Content-Type: application/json`，如果需要其他类型，请在请求中明确指定。

### 请求体转发

- `GET`、`HEAD`、`OPTIONS` 请求不会转发请求体
- `POST`、`PUT`、`PATCH`、`DELETE` 请求会转发请求体

### 查询参数转发

所有URL查询参数（`?key=value`）都会被自动转发。

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 第三方API返回的原始数据
  }
}
```

HTTP状态码与第三方API返回的状态码一致。

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    // 第三方API返回的错误详情
  }
}
```

HTTP状态码与第三方API返回的错误状态码一致。

## 常见问题

### 1. API配置不生效

**问题：** 添加了环境变量但API无法访问

**解决方案：**
- 确认 `.env` 文件在项目根目录
- 确认环境变量名称格式正确：`API_{NAME}_BASE_URL` 和 `API_{NAME}_VERSION`
- 重启服务器使配置生效
- 检查API名称是否匹配（不区分大小写，但会自动转换为小写）

### 2. 404错误 - API配置不存在

**问题：** 返回 `API配置不存在: {api_name}`

**解决方案：**
- 检查 `.env` 文件中是否配置了对应的 `API_{NAME}_BASE_URL`
- 确认API名称拼写正确（不区分大小写）
- 确认服务器已重启

### 3. URL构建错误

**问题：** 转发的URL不正确

**解决方案：**
- 检查 `BASE_URL` 是否正确（不包含版本号和末尾斜杠）
- 检查 `VERSION` 是否正确（如果不需要版本号，可以不设置）
- 检查请求路径是否正确

### 4. 认证失败

**问题：** 第三方API返回认证错误

**解决方案：**
- 确认 `Authorization` 请求头已正确设置
- 确认API密钥或令牌有效
- 检查请求头格式是否正确（例如：`Bearer {token}`）

### 5. 请求体未转发

**问题：** POST请求的请求体没有被转发

**解决方案：**
- 确认请求方法为 `POST`、`PUT`、`PATCH` 或 `DELETE`
- 确认请求头包含 `Content-Type: application/json`
- 确认请求体格式为有效的JSON

## 测试

项目包含完整的测试用例，可以参考以下文件：

- `src/test/api-config.test.js` - API配置测试
- `src/test/proxy-service.test.js` - 转发服务测试
- `src/test/proxy-controller.test.js` - 控制器测试

运行测试：

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 最佳实践

1. **命名规范**
   - API名称使用大写字母和下划线：`MY_API`、`PAYMENT_SERVICE`
   - 保持命名清晰和一致

2. **版本管理**
   - 如果API有版本号，建议在环境变量中配置
   - 版本升级时只需修改环境变量，无需修改代码

3. **安全性**
   - 不要在代码中硬编码API密钥
   - 使用环境变量管理敏感信息
   - 确保 `.env` 文件已添加到 `.gitignore`

4. **错误处理**
   - 代理服务会自动处理错误并返回统一格式
   - 客户端可以根据 `success` 字段判断请求是否成功

5. **日志记录**
   - 所有转发请求都会记录到日志中
   - 可以通过日志查看请求详情和错误信息

## 扩展性

代理服务设计为高度可扩展：

- **添加新API**：只需在 `.env` 文件中添加配置，无需修改代码
- **支持多个API**：可以同时配置多个第三方API
- **统一接口**：所有API使用相同的代理接口，保持一致性

## 相关文件

- 配置文件：`src/config/api-config.js`
- 转发服务：`src/services/proxy-service.js`
- 控制器：`src/controllers/proxy-controller.js`
- 路由配置：`src/routes/v1/index.js`
- 测试文件：`src/test/`

## 更新日志

- 2024-01-17：初始版本，支持基本的API代理功能
