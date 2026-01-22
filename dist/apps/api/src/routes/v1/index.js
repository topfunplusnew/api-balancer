const express = require("express");
const { InfoController, ProxyController, AuthController, ApiKeyController, SupabaseAdminController, TemplateConfigController, } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const router = express.Router();
router.get("/info", InfoController.info);
// 模板配置路由（不需要鉴权）
router.get("/template-config", TemplateConfigController.getTemplateConfig);
// 鉴权相关路由（不需要鉴权）
router.post("/auth/api-key", AuthController.getApiKey);
router.post("/auth/api-key-order", AuthController.getApiKeyWithOrderAuth);
// APIKEY 管理路由（需要鉴权）
router.post("/api-keys", authMiddleware, ApiKeyController.createApiKey);
router.get("/api-keys", authMiddleware, ApiKeyController.listApiKeys);
router.delete("/api-keys/:id", authMiddleware, ApiKeyController.deleteApiKey);
router.patch("/api-keys/:id/toggle", authMiddleware, ApiKeyController.toggleApiKey);
// Supabase Admin 路由（需要鉴权）
router.get("/supabase/users", authMiddleware, SupabaseAdminController.listUsers);
// 第三方 API 通用代理（需要鉴权）
// 路径格式：/{module}/{version}/{path}
// 示例：/creatomate/v1/templates
router.all("/:apiName/:path(*)", authMiddleware, ProxyController.genericProxy);
module.exports = router;
