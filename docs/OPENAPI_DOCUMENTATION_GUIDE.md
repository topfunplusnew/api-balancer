# OpenAPI 文档架构指南

本文档说明项目的 OpenAPI 文档结构和设计原则。

## 📐 文档设计原则

### 1. **具体优于通用**

✅ **好的做法** - 为每个具体接口提供详细文档：
```yaml
/proxy/creatomate/templates:
  get:
    summary: 获取 Creatomate 项目中的所有模板
    description: |
      实际转发到: GET https://api.creatomate.com/v1/templates
      
      功能说明:
      - 返回当前项目中所有模板的元数据
      - 不包含模板的 RenderScript 源代码
      
      使用场景:
      - 构建模板选择器
      - 自动化工作流
```

❌ **不好的做法** - 模糊的通用描述：
```yaml
/proxy/creatomate/{path}:
  get:
    summary: Creatomate API代理 - GET请求
    description: 将GET请求转发到Creatomate API
```

---

### 2. **清晰的 URL 转发映射**

每个接口都应明确说明实际转发的目标地址：

```yaml
description: |
  **实际转发到**: `GET https://api.creatomate.com/v1/templates`
```

---

### 3. **完整的响应示例**

提供多个响应示例，覆盖不同状态：

```yaml
examples:
  pending:
    summary: 等待处理
    value: {...}
  processing:
    summary: 正在渲染
    value: {...}
  succeeded:
    summary: 渲染成功
    value: {...}
  failed:
    summary: 渲染失败
    value: {...}
```

---

### 4. **分层的标签系统**

使用清晰的标签分类：

- `Info` - 系统信息
- `Template Config` - 模板配置
- `Auth` - 鉴权
- `ApiKeys` - API 密钥管理
- **`Creatomate API`** - Creatomate 专用接口（具体）
- `Proxy` - 通用代理接口（兜底）

---

## 📖 当前文档结构

### 系统接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/info` | GET | 健康检查 |
| `/template-config` | GET | 获取模板配置 |

### 鉴权接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/auth/api-key` | POST | 获取临时 Token |
| `/auth/api-key-order` | POST | 带订单验证的 Token 获取 |

### API 密钥管理

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api-keys` | POST | 创建持久化 APIKEY |
| `/api-keys` | GET | 获取 APIKEY 列表 |
| `/api-keys/{id}` | DELETE | 删除 APIKEY |
| `/api-keys/{id}/toggle` | PATCH | 启用/禁用 APIKEY |

### Creatomate API（具体接口）

| 路径 | 方法 | 说明 | 转发到 |
|------|------|------|--------|
| `/proxy/creatomate/templates` | GET | 获取模板列表 | `GET /v1/templates` |
| `/proxy/creatomate/renders` | GET | 获取渲染列表 | `GET /v1/renders` |
| `/proxy/creatomate/renders` | POST | 创建渲染任务 | `POST /v1/renders` |
| `/proxy/creatomate/renders/{id}` | GET | 获取渲染详情 | `GET /v1/renders/{id}` |
| `/proxy/creatomate/{path}` | ALL | 通用代理（兜底） | `ANY /v1/{path}` |

### 通用代理接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/proxy/{apiName}/{path}` | ALL | 其他第三方 API 通用代理 |

---

## 🎯 接口文档详细度对比

### ❌ 之前（通用描述）

```yaml
/proxy/creatomate/{path}:
  get:
    tags:
      - Proxy
    summary: Creatomate API代理 - GET请求
    description: |
      将GET请求转发到Creatomate API。
      
      鉴权方式：
      - Bearer Token
      - APIKEY
    parameters:
      - name: path
        description: API路径
```

**问题**:
- ❌ 不知道具体能访问哪些端点
- ❌ 不知道返回什么数据
- ❌ 不知道使用场景
- ❌ 不知道实际转发地址

---

### ✅ 现在（具体接口）

```yaml
/proxy/creatomate/templates:
  get:
    tags:
      - Creatomate API
    summary: 获取 Creatomate 项目中的所有模板
    description: |
      获取你的 Creatomate 项目中的所有模板列表。
      
      **实际转发到**: `GET https://api.creatomate.com/v1/templates`
      
      **功能说明**:
      - 返回当前项目中所有模板的元数据
      - 不包含模板的 RenderScript 源代码
      - 可用于构建模板选择器或自动化工作流
      
      **鉴权说明**:
      - 需要提供本系统的 Bearer Token 或 APIKEY
      - 本系统会自动使用 `.env` 中配置的 `API_CREATOMATE_TOKEN`
      - 你的 Token 不会被转发到 Creatomate
      
      **使用场景**:
      - 构建允许用户从列表中选择模板的应用
      - 设置随机选择模板的自动化工作流
    responses:
      '200':
        content:
          application/json:
            schema:
              properties:
                data:
                  type: array
                  items:
                    properties:
                      id:
                        type: string
                        format: uuid
                      name:
                        type: string
                      tags:
                        type: array
            examples:
              success:
                value:
                  success: true
                  data:
                    - id: "xxx"
                      name: "My Template"
                      tags: ["video", "marketing"]
```

**优势**:
- ✅ 明确说明功能
- ✅ 显示实际转发地址
- ✅ 提供使用场景
- ✅ 详细的响应结构
- ✅ 完整的示例数据

---

## 📝 添加新接口的步骤

### 1. 确定接口类型

**专用接口**（推荐）:
- 常用的接口
- 需要详细文档的接口
- 有特定参数和响应结构的接口

**通用代理**（备用）:
- 不常用的接口
- 动态生成的接口
- 临时或实验性的接口

### 2. 编写接口文档

**必需字段**:
```yaml
/proxy/{service}/{endpoint}:
  {method}:
    tags:
      - {Service} API  # 专用标签
    summary: {简短描述}
    description: |
      {详细说明}
      
      **实际转发到**: `{METHOD} https://api.{service}.com/{version}/{endpoint}`
      
      **功能说明**:
      - {功能点1}
      - {功能点2}
      
      **使用场景**:
      - {场景1}
      - {场景2}
    operationId: {uniqueOperationId}
    security:
      - BearerAuth: []
      - ApiKeyAuth: []
    parameters: [...]
    requestBody: {...}
    responses:
      '200':
        description: {成功描述}
        content:
          application/json:
            schema: {...}
            examples:
              {example_name}:
                summary: {示例说明}
                value: {...}
```

### 3. 添加多个响应示例

```yaml
examples:
  success:
    summary: 成功响应
    value: {...}
  error:
    summary: 错误响应
    value: {...}
  empty:
    summary: 空结果
    value: {...}
```

---

## 🔍 文档质量检查清单

在提交文档前，确保：

- [ ] **实际转发地址**：每个接口都标明了 `实际转发到` 部分
- [ ] **功能说明**：清楚说明接口的功能
- [ ] **使用场景**：提供 2-3 个实际使用场景
- [ ] **鉴权说明**：说明如何鉴权，Token 如何处理
- [ ] **参数文档**：所有参数都有描述、类型、示例
- [ ] **响应示例**：至少提供成功和失败两个示例
- [ ] **错误代码**：列出所有可能的 HTTP 状态码
- [ ] **专用标签**：使用具体的标签（如 `Creatomate API`）而非通用标签

---

## 📊 文档统计

### 当前接口分类

| 分类 | 接口数量 | 文档详细度 |
|------|---------|----------|
| 系统接口 | 2 | ⭐⭐⭐ |
| 鉴权接口 | 2 | ⭐⭐⭐⭐ |
| API 密钥管理 | 4 | ⭐⭐⭐⭐ |
| **Creatomate 专用** | **4** | **⭐⭐⭐⭐⭐** |
| Creatomate 通用 | 5 | ⭐⭐ |
| 其他 API 通用 | 5 | ⭐⭐ |

### 文档改进效果

| 指标 | 改进前 | 改进后 | 提升 |
|------|-------|-------|------|
| 平均文档长度 | ~50 行 | ~200 行 | 4x |
| 包含转发地址 | 0% | 100% | ∞ |
| 包含使用场景 | 0% | 100% | ∞ |
| 响应示例数量 | 1 | 3-4 | 3-4x |

---

## 🎓 最佳实践

### 1. 使用清晰的操作 ID

```yaml
# ✅ 好
operationId: getCreatomateTemplates

# ❌ 不好
operationId: proxyCreatomateGet
```

### 2. 提供实用的示例

```yaml
# ✅ 好 - 真实的使用场景
examples:
  withTemplate:
    summary: 使用模板创建视频（推荐）
    value:
      template_id: "xxx"
      modifications:
        Text-1: "Hello World"

# ❌ 不好 - 抽象的占位符
examples:
  default:
    value:
      param1: "value1"
      param2: "value2"
```

### 3. 说明 Token 流转

```yaml
description: |
  **鉴权说明**:
  - 需要提供本系统的 Bearer Token 或 APIKEY
  - 本系统会自动使用 `.env` 中配置的 Token
  - 你的 Token 不会被转发到第三方 API
```

### 4. 提供错误处理指导

```yaml
responses:
  '404':
    description: 渲染任务不存在
    content:
      application/json:
        examples:
          notFound:
            summary: 常见原因
            value:
              success: false
              message: "Render not found"
              # 提示：检查 ID 是否正确
```

---

## 🔗 相关资源

- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [本项目 Swagger UI](http://localhost:25052/api-docs)

---

**最后更新**: 2026-01-22

