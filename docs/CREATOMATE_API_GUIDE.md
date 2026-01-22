# Creatomate API 代理使用指南

本文档详细说明如何使用本系统代理 Creatomate API 的各个接口。

## 📋 目录

- [快速开始](#快速开始)
- [接口列表](#接口列表)
- [详细说明](#详细说明)
- [鉴权机制](#鉴权机制)
- [使用示例](#使用示例)
- [错误处理](#错误处理)

---

## 🚀 快速开始

### 1. 配置 Creatomate Token

在项目根目录的 `.env` 文件中配置：

```env
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2
API_CREATOMATE_TOKEN=your_creatomate_api_token_here
```

### 2. 获取访问 Token

```bash
POST http://localhost:25052/api/v1/auth/api-key
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. 调用 Creatomate 代理接口

```bash
GET http://localhost:25052/api/v1/proxy/creatomate/templates
Authorization: Bearer YOUR_ACCESS_KEY_HERE
```

---

## 📡 接口列表

| 接口 | 方法 | 说明 | 实际转发地址 |
|------|------|------|-------------|
| `/proxy/creatomate/templates` | GET | 获取项目中的所有模板 | `GET /v1/templates` |
| `/proxy/creatomate/renders` | GET | 获取渲染列表 | `GET /v1/renders` |
| `/proxy/creatomate/renders` | POST | 创建渲染任务 | `POST /v1/renders` |
| `/proxy/creatomate/renders/{id}` | GET | 获取渲染详情 | `GET /v1/renders/{id}` |
| `/proxy/creatomate/{path}` | ALL | 通用代理（支持所有路径） | `/{version}/{path}` |

---

## 📖 详细说明

### 1️⃣ 获取模板列表

**接口地址**: `GET /api/v1/proxy/creatomate/templates`

**实际转发到**: `GET https://api.creatomate.com/v1/templates`

**功能说明**:
- 返回当前 Creatomate 项目中所有模板的元数据
- 包含模板的 ID、名称、标签、创建时间和更新时间
- 不包含模板的 RenderScript 源代码

**响应格式**:
```json
{
  "success": true,
  "message": "获取模板列表成功",
  "data": [
    {
      "id": "c937d125-b99b-4690-96f0-6aa1f09438c9",
      "name": "My Template",
      "tags": ["My", "Assigned", "Tags"],
      "created_at": "2026-01-01 12:00:00.000 +0200",
      "updated_at": "2026-01-01 12:00:00.000 +0200"
    },
    {
      "id": "bf95f053-28e1-4300-ac86-b52e5a3e0e5e",
      "name": "Another Template",
      "tags": [],
      "created_at": "2026-01-01 12:00:00.000 +0200",
      "updated_at": "2026-01-01 12:00:00.000 +0200"
    }
  ]
}
```

**使用场景**:
- 构建模板选择器：让用户从列表中选择模板
- 自动化工作流：随机选择模板进行批量渲染
- 项目管理：获取所有模板的概览

**示例代码**:

```bash
# cURL
curl -X GET "http://localhost:25052/api/v1/proxy/creatomate/templates" \
     -H "Authorization: Bearer YOUR_ACCESS_KEY"
```

```javascript
// JavaScript (Fetch API)
const response = await fetch('http://localhost:25052/api/v1/proxy/creatomate/templates', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_KEY'
  }
});
const result = await response.json();
console.log(result.data); // 模板列表
```

```python
# Python (requests)
import requests

response = requests.get(
    'http://localhost:25052/api/v1/proxy/creatomate/templates',
    headers={'Authorization': 'Bearer YOUR_ACCESS_KEY'}
)
templates = response.json()['data']
```

---

### 2️⃣ 获取渲染列表

**接口地址**: `GET /api/v1/proxy/creatomate/renders`

**实际转发到**: `GET https://api.creatomate.com/v1/renders`

**查询参数**:
| 参数 | 类型 | 必需 | 说明 | 默认值 |
|------|------|------|------|--------|
| `page` | integer | 否 | 页码（从 1 开始） | 1 |
| `limit` | integer | 否 | 每页数量 | 10 |

**响应格式**:
```json
{
  "success": true,
  "data": {
    // Creatomate API 返回的渲染列表数据
  }
}
```

**示例**:
```bash
GET http://localhost:25052/api/v1/proxy/creatomate/renders?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_KEY
```

---

### 3️⃣ 创建渲染任务

**接口地址**: `POST /api/v1/proxy/creatomate/renders`

**实际转发到**: `POST https://api.creatomate.com/v1/renders`

**方式一：使用模板创建**

```json
{
  "template_id": "c937d125-b99b-4690-96f0-6aa1f09438c9",
  "modifications": {
    "Text-1": "Hello World",
    "Image-1": "https://example.com/image.jpg"
  }
}
```

**方式二：自定义渲染（使用 RenderScript）**

```json
{
  "output_format": "mp4",
  "width": 1280,
  "height": 720,
  "duration": 3,
  "frame_rate": 30,
  "elements": [
    {
      "type": "text",
      "text": "My first video!",
      "fill_color": "#ff0000",
      "width": "50%",
      "height": "25%"
    }
  ]
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "id": "d8e2f891-3c4a-4b5c-8d7e-1f2a3b4c5d6e",
    "status": "pending",
    // 其他渲染任务信息
  }
}
```

---

### 4️⃣ 获取渲染详情

**接口地址**: `GET /api/v1/proxy/creatomate/renders/{renderId}`

**实际转发到**: `GET https://api.creatomate.com/v1/renders/{renderId}`

**路径参数**:
- `renderId`: 渲染任务 ID

**响应格式**:
```json
{
  "success": true,
  "data": {
    "id": "d8e2f891-3c4a-4b5c-8d7e-1f2a3b4c5d6e",
    "status": "succeeded",
    "url": "https://cdn.creatomate.com/renders/xxx.mp4",
    "progress": 100,
    // 其他详细信息
  }
}
```

**状态说明**:
- `pending`: 等待处理
- `processing`: 正在渲染
- `succeeded`: 渲染成功
- `failed`: 渲染失败

**示例**:
```bash
GET http://localhost:25052/api/v1/proxy/creatomate/renders/d8e2f891-3c4a-4b5c-8d7e-1f2a3b4c5d6e
Authorization: Bearer YOUR_ACCESS_KEY
```

---

### 5️⃣ 通用代理接口

**接口地址**: `ALL /api/v1/proxy/creatomate/{path}`

**说明**: 
- 支持所有 HTTP 方法（GET, POST, PUT, PATCH, DELETE）
- 支持任意 Creatomate API 路径
- 自动添加版本号和鉴权

**示例**:
```bash
# 删除渲染任务
DELETE http://localhost:25052/api/v1/proxy/creatomate/renders/{renderId}
Authorization: Bearer YOUR_ACCESS_KEY

# 获取模板详情
GET http://localhost:25052/api/v1/proxy/creatomate/templates/{templateId}
Authorization: Bearer YOUR_ACCESS_KEY
```

---

## 🔐 鉴权机制

### Token 流转说明

```
用户请求 → 本系统 → Creatomate API
   ↓           ↓            ↓
用户Token   系统Token   Creatomate Token
```

**重要特性**:
1. **Token 隔离**: 你的 Token 不会被转发到 Creatomate
2. **统一鉴权**: 使用本系统的 Bearer Token 或 APIKEY
3. **自动配置**: 系统自动使用 `.env` 中的 `API_CREATOMATE_TOKEN`

### 鉴权方式

**方式一：Bearer Token（临时）**
```bash
Authorization: Bearer admin_1234567890_abcdef
```

**方式二：APIKEY（持久化）**
```bash
# HTTP Header
X-API-Key: sk_xxxxxxxxxxxxx

# 或 Query 参数
?api_key=sk_xxxxxxxxxxxxx
```

---

## 💡 使用示例

### 示例 1：构建模板选择器

```javascript
// 1. 获取所有模板
async function getTemplates() {
  const response = await fetch(
    'http://localhost:25052/api/v1/proxy/creatomate/templates',
    {
      headers: {
        'Authorization': `Bearer ${YOUR_TOKEN}`
      }
    }
  );
  const result = await response.json();
  return result.data;
}

// 2. 渲染 UI
const templates = await getTemplates();
templates.forEach(template => {
  console.log(`${template.name} (${template.id})`);
});
```

### 示例 2：批量生成视频

```javascript
// 1. 获取模板列表
const templates = await getTemplates();

// 2. 随机选择一个模板
const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

// 3. 创建渲染任务
const response = await fetch(
  'http://localhost:25052/api/v1/proxy/creatomate/renders',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${YOUR_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: randomTemplate.id,
      modifications: {
        'Text-1': 'Generated Video #' + Date.now()
      }
    })
  }
);

const result = await response.json();
console.log('Render ID:', result.data.id);
```

### 示例 3：轮询渲染状态

```javascript
async function waitForRender(renderId) {
  while (true) {
    const response = await fetch(
      `http://localhost:25052/api/v1/proxy/creatomate/renders/${renderId}`,
      {
        headers: {
          'Authorization': `Bearer ${YOUR_TOKEN}`
        }
      }
    );
    
    const result = await response.json();
    const status = result.data.status;
    
    if (status === 'succeeded') {
      console.log('视频 URL:', result.data.url);
      return result.data.url;
    } else if (status === 'failed') {
      throw new Error('渲染失败');
    }
    
    console.log(`进度: ${result.data.progress}%`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
  }
}

// 使用
const videoUrl = await waitForRender('d8e2f891-3c4a-4b5c-8d7e-1f2a3b4c5d6e');
```

---

## ❌ 错误处理

### 常见错误

#### 1. 鉴权失败 (401)

```json
{
  "success": false,
  "message": "鉴权失败，请提供有效的 Bearer Token 或 APIKEY",
  "error": {}
}
```

**解决方案**:
- 检查 Token 是否有效
- 确认 Token 未过期
- 使用正确的鉴权方式

#### 2. Creatomate Token 无效 (401)

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": {
    "message": "Invalid API key"
  }
}
```

**解决方案**:
- 检查 `.env` 中的 `API_CREATOMATE_TOKEN` 是否正确
- 在 Creatomate Dashboard 中重新生成 Token
- 重启服务使配置生效

#### 3. 资源不存在 (404)

```json
{
  "success": false,
  "message": "Not Found",
  "error": {
    "message": "Render not found"
  }
}
```

**解决方案**:
- 检查模板 ID 或渲染 ID 是否正确
- 确认资源属于当前项目

#### 4. 请求参数错误 (400)

```json
{
  "success": false,
  "message": "Bad Request",
  "error": {
    "message": "Invalid request parameters"
  }
}
```

**解决方案**:
- 检查请求体格式是否正确
- 确认必需参数已提供
- 参考 API 文档检查参数类型

---

## 📚 相关资源

- **Swagger UI**: http://localhost:25052/api-docs
- **Creatomate 官方文档**: https://creatomate.com/docs
- **项目鉴权指南**: [docs/AUTH_GUIDE.md](./AUTH_GUIDE.md)
- **代理服务指南**: [docs/API_PROXY_GUIDE.md](./API_PROXY_GUIDE.md)

---

## 🔧 配置参考

### 完整的 .env 配置

```env
# Creatomate API 配置
API_CREATOMATE_BASE_URL=https://api.creatomate.com
API_CREATOMATE_VERSION=v2
API_CREATOMATE_TOKEN=your_creatomate_api_token_here
```

### 获取 Creatomate Token

1. 登录 Creatomate Dashboard: https://creatomate.com/dashboard
2. 进入 Settings > API Keys
3. 创建新的 API Key 或复制现有的
4. 将 Token 粘贴到 `.env` 文件中
5. 重启服务

---

## 🎯 最佳实践

1. **使用持久化 APIKEY**
   - 生产环境使用持久化 APIKEY 而非临时 Token
   - 定期轮换 APIKEY 提高安全性

2. **错误处理**
   - 始终检查响应的 `success` 字段
   - 实现重试机制处理临时错误

3. **性能优化**
   - 缓存模板列表减少请求
   - 使用 Webhook 而非轮询获取渲染状态

4. **日志记录**
   - 记录所有 API 调用和错误
   - 便于问题排查和审计

---

**最后更新**: 2026-01-22

