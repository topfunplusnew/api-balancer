const express = require("express");

const {
  InfoController,
  ProxyController,
  AuthController,
  ApiKeyController,
  SupabaseAdminController,
} = require("../../controllers");
const { authMiddleware } = require("../../middlewares");

const router = express.Router();

router.get("/info", InfoController.info);

// 鉴权相关路由（不需要鉴权）
router.post("/auth/api-key", AuthController.getApiKey);

// APIKEY 管理路由（需要鉴权）
router.post("/api-keys", authMiddleware, ApiKeyController.createApiKey);
router.get("/api-keys", authMiddleware, ApiKeyController.listApiKeys);
router.delete("/api-keys/:id", authMiddleware, ApiKeyController.deleteApiKey);
router.patch("/api-keys/:id/toggle", authMiddleware, ApiKeyController.toggleApiKey);

// Supabase Admin 路由（需要鉴权）
router.get("/supabase/users", authMiddleware, SupabaseAdminController.listUsers);

// Creatomate API转发路由（需要鉴权）
router.all("/proxy/creatomate/:path(*)", authMiddleware, ProxyController.creatomateProxy);

// Coze API转发路由（需要鉴权）
router.all("/proxy/coze/:path(*)", authMiddleware, ProxyController.cozeProxy);

// n8n API转发路由（需要鉴权）
router.all("/proxy/n8n/:path(*)", authMiddleware, ProxyController.n8nProxy);

// 通用API转发路由（支持动态API名称，需要鉴权）
router.all("/proxy/:apiName/:path(*)", authMiddleware, ProxyController.genericProxy);

module.exports = router;
