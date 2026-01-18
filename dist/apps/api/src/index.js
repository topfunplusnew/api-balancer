const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { ServerConfig, Redis } = require("./config");
const apiRoutes = require("./routes");
const { swaggerUi, swaggerSpecs } = require("./config/swagger-config");
const { AuthController, ApiKeyController } = require("./controllers");
const { authMiddleware } = require("./middlewares");
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ServerConfig.CORS_ORIGIN,
    credentials: true,
}));
// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// 便捷路由（兼容旧路径，直接转发到正确的处理器）
app.post("/auth/api-key", AuthController.getApiKey);
app.post("/api-keys", authMiddleware, ApiKeyController.createApiKey);
app.get("/api-keys", authMiddleware, ApiKeyController.listApiKeys);
app.delete("/api-keys/:id", authMiddleware, ApiKeyController.deleteApiKey);
app.patch("/api-keys/:id/toggle", authMiddleware, ApiKeyController.toggleApiKey);
app.use("/api", apiRoutes);
// 初始化Redis连接
Redis.initRedis();
// 优雅关闭
process.on("SIGTERM", async () => {
    console.log("SIGTERM信号 received，正在关闭服务器...");
    await Redis.closeRedis();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("SIGINT信号 received，正在关闭服务器...");
    await Redis.closeRedis();
    process.exit(0);
});
app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    console.log(`Swagger UI available at http://localhost:${ServerConfig.PORT}/api-docs`);
});
