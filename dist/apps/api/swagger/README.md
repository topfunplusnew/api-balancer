# OpenAPI 文档说明

本目录包含项目的OpenAPI/Swagger API文档。

## 文件结构

```
apps/api/swagger/
├── openapi.yaml          # 主OpenAPI文档（包含所有接口定义）
├── modules/              # 模块化文档（可选，用于组织大型API）
│   ├── info.yaml         # 系统信息模块
│   ├── auth.yaml         # 鉴权模块
│   └── proxy.yaml        # 代理服务模块
└── README.md             # 本文件
```

## 访问Swagger UI

启动服务器后，访问以下地址查看API文档：

```
http://localhost:5000/api-docs
```

## 文档结构

### 主文档 (openapi.yaml)

主文档包含：
- API基本信息（标题、描述、版本）
- 服务器配置（开发/生产环境）
- 所有接口路径定义
- 通用组件定义（schemas、securitySchemes）

### 模块文档 (modules/)

模块文档按功能划分：
- **info.yaml**: 系统信息相关接口
- **auth.yaml**: 鉴权相关接口
- **proxy.yaml**: API代理服务接口

## 接口分类

### 1. Info（系统信息）
- `GET /api/v1/info` - 健康检查

### 2. Auth（鉴权）
- `POST /api/v1/auth/api-key` - 获取API Key

### 3. Proxy（代理服务）
- `ALL /api/v1/proxy/creatomate/{path}` - Creatomate API代理
- `ALL /api/v1/proxy/{apiName}/{path}` - 通用API代理

## 使用Swagger UI

1. **启动服务器**
   ```bash
   pnpm dev
   ```

2. **访问Swagger UI**
   打开浏览器访问：http://localhost:5000/api-docs

3. **测试接口**
   - 在Swagger UI中可以查看所有接口的详细文档
   - 可以直接在UI中测试接口
   - 支持设置Authorization Bearer token

## 更新文档

### 添加新接口

1. 编辑 `apps/api/swagger/openapi.yaml`
2. 在 `paths` 部分添加新的路径定义
3. 添加相应的tag（如果不存在）
4. 重启服务器查看更新

### 修改现有接口

1. 找到对应的路径定义
2. 修改请求/响应定义
3. 重启服务器查看更新

## 文档规范

文档遵循 OpenAPI 3.0.3 规范，包含：

- **基本信息**: title, description, version
- **服务器**: 开发和生产环境URL
- **路径**: 所有API端点
- **操作**: HTTP方法（GET, POST, PUT, PATCH, DELETE）
- **参数**: 路径参数、查询参数、请求体
- **响应**: 成功和错误响应
- **安全**: Bearer认证方案
- **组件**: 可复用的schemas和securitySchemes

## 注意事项

1. **安全性**: 生产环境建议禁用Swagger UI或添加访问控制
2. **版本控制**: 文档版本应与API版本保持一致
3. **及时更新**: API变更时及时更新文档
4. **示例数据**: 使用有意义的示例数据，避免敏感信息

## 相关文档

- [API代理服务使用指南](../../docs/API_PROXY_GUIDE.md)
- [API鉴权系统使用指南](../../docs/AUTH_GUIDE.md)
