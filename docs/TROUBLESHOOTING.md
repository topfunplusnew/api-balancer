# 故障排查指南

本文档列出常见问题及其解决方案。

## 🔧 API 代理问题

### 问题 1: 目标地址缺少版本号

**现象**:
```
目标地址: https://api.creatomate.com/templates ❌
正确地址: https://api.creatomate.com/v1/templates ✅
```

**原因**:
配置文件中的 `version` 字段为空字符串。

**解决方案**:
修改 `apps/api/src/config/third-party-apis/creatomate/config.js`：

```javascript
module.exports = {
  baseUrl: "https://api.creatomate.com",
  version: "v1",  // ✅ 确保设置了版本号
  // ...
};
```

或者在 `.env` 文件中配置：
```env
API_CREATOMATE_VERSION=v1
```

**验证**:
重启服务后，查看日志：
```
[Proxy] >>> 目标地址: https://api.creatomate.com/v1/templates ✅
```

---

### 问题 2: 404 Not Found

**现象**:
```
GET /api/v1/templates 404
```

**原因**:
请求路径缺少 `/proxy/{apiName}` 前缀。

**解决方案**:
使用正确的路径：
```bash
# 错误
GET /api/v1/templates ❌

# 正确
GET /api/v1/proxy/creatomate/templates ✅
```

---

### 问题 3: 401 Unauthorized (Creatomate API)

**现象**:
```
[Proxy] <<< HTTP状态码: 401
[Proxy] <<< 错误响应: {"error": "Invalid API key"}
```

**原因**:
Creatomate Token 无效或已过期。

**解决方案**:

1. **检查配置文件**:
```javascript
// apps/api/src/config/third-party-apis/creatomate/config.js
auth: {
  type: "bearer",
  token: "your_actual_creatomate_token"  // 确保这是有效的 Token
}
```

2. **或在 .env 中配置**:
```env
API_CREATOMATE_TOKEN=your_actual_creatomate_token
```

3. **获取新的 Token**:
   - 登录 Creatomate Dashboard: https://creatomate.com/dashboard
   - 进入 Settings > API Keys
   - 创建或复制 API Key

4. **重启服务**:
```bash
# 停止服务 (Ctrl+C)
# 重新启动
pnpm dev
```

---

### 问题 4: 401 Unauthorized (本系统鉴权)

**现象**:
```json
{
  "success": false,
  "message": "鉴权失败，请提供有效的 Bearer Token 或 APIKEY"
}
```

**原因**:
本系统的 Token 无效或未提供。

**解决方案**:

1. **获取新的 Token**:
```bash
curl -X POST http://localhost:25052/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
```

2. **使用 Token**:
```bash
curl -X GET "http://localhost:25052/api/v1/proxy/creatomate/templates" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 问题 5: API配置不存在

**现象**:
```json
{
  "success": false,
  "message": "API配置不存在: creatomate"
}
```

**原因**:
API 配置文件未加载或配置错误。

**解决方案**:

1. **检查配置文件是否存在**:
```
apps/api/src/config/third-party-apis/creatomate/config.js
```

2. **检查配置文件格式**:
```javascript
module.exports = {
  baseUrl: "https://api.creatomate.com",  // 必需
  version: "v1",
  auth: {
    type: "bearer",
    token: "your_token"
  }
};
```

3. **重启服务**:
```bash
pnpm dev
```

---

### 问题 6: 网络连接错误

**现象**:
```
[Proxy] <<< 网络错误: 无法连接到目标服务器
```

**原因**:
- 目标 API 服务器不可达
- 网络连接问题
- 防火墙阻止

**解决方案**:

1. **检查目标地址是否可访问**:
```bash
curl https://api.creatomate.com/v1/templates
```

2. **检查网络连接**:
```bash
ping api.creatomate.com
```

3. **检查代理设置**:
```bash
# 如果在代理环境下
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

---

## 🔐 鉴权问题

### Token 过期

**现象**:
临时 Token 无法使用。

**原因**:
- Redis 中的 Token 已过期（默认 24 小时）
- 服务重启导致内存中的 Token 丢失

**解决方案**:
重新获取 Token 或使用持久化 APIKEY。

---

## 🗄️ 数据库问题

### Supabase 连接失败

**现象**:
```
警告: Supabase配置未设置
```

**解决方案**:

1. **检查 .env 配置**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **重启服务**。

---

## 💾 Redis 问题

### Redis 连接失败

**现象**:
```
Redis连接错误: connect ECONNREFUSED
```

**解决方案**:

1. **检查 Redis 是否运行**:
```bash
redis-cli ping
# 应返回: PONG
```

2. **启动 Redis**:
```bash
# Windows
redis-server

# Docker
docker run -d -p 6379:6379 redis:alpine

# 或使用项目的 docker-compose
pnpm docker:up
```

3. **检查配置**:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## 📝 配置问题

### 环境变量未生效

**现象**:
修改 `.env` 文件后配置没有更新。

**解决方案**:
环境变量在服务启动时加载，需要重启服务：

```bash
# 停止服务 (Ctrl+C)
# 重新启动
pnpm dev
```

---

### 配置优先级

配置的读取优先级（从高到低）：

1. 环境变量（`.env` 文件）
2. 配置文件中的默认值

**示例**:
```javascript
// 配置文件
const token = process.env.API_CREATOMATE_TOKEN || "default_token";

// 如果 .env 中设置了 API_CREATOMATE_TOKEN，则使用 .env 的值
// 否则使用 "default_token"
```

---

## 🐛 调试技巧

### 1. 查看详细日志

启动服务后，每个代理请求都会显示详细日志：

```
================================================================================
[Controller] 收到请求: GET /api/v1/proxy/creatomate/templates
[Controller] 路由路径: /proxy/creatomate/templates
[Controller] 查询参数: {}
================================================================================
[Proxy] API代理请求 - CREATOMATE
================================================================================
[Proxy] >>> 请求方法: GET
[Proxy] >>> 目标地址: https://api.creatomate.com/v1/templates
[Proxy] >>> 原始路径: templates
[Proxy] >>> 请求头: {...}
================================================================================
```

### 2. 测试配置是否正确

**测试 Creatomate Token**:
```bash
curl -X GET "https://api.creatomate.com/v1/templates" \
     -H "Authorization: Bearer YOUR_CREATOMATE_TOKEN"
```

**测试本系统 Token**:
```bash
curl -X GET "http://localhost:25052/api/v1/api-keys" \
     -H "Authorization: Bearer YOUR_SYSTEM_TOKEN"
```

### 3. 检查路由是否注册

查看 `apps/api/src/routes/v1/index.js`:
```javascript
// 确保这行存在
router.get("/proxy/creatomate/templates", authMiddleware, ProxyController.getCreatomateTemplates);
```

### 4. 验证 API 配置加载

在 `apps/api/src/config/api-config.js` 底部添加临时日志：
```javascript
const config = loadApiConfigs();
console.log("已加载的 API 配置:", Object.keys(config));
module.exports = config;
```

---

## 📚 相关文档

- [API 接口速查表](./API_ENDPOINTS_REFERENCE.md)
- [Creatomate API 指南](./CREATOMATE_API_GUIDE.md)
- [环境变量配置](./ENV_SETUP.md)
- [鉴权系统指南](./AUTH_GUIDE.md)

---

## 🆘 仍然无法解决？

1. **查看完整日志**:
   ```bash
   tail -f combined.log
   ```

2. **检查所有配置文件**:
   - `.env`
   - `apps/api/src/config/third-party-apis/creatomate/config.js`
   - `apps/api/src/routes/v1/index.js`

3. **完全重启**:
   ```bash
   # 停止所有服务
   pnpm docker:down
   
   # 清理并重启
   pnpm docker:build
   pnpm docker:up
   ```

4. **检查端口占用**:
   ```bash
   # Windows
   netstat -ano | findstr :25052
   
   # Linux/Mac
   lsof -i :25052
   ```

---

**最后更新**: 2026-01-22

