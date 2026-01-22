/**
 * n8n API 配置
 */
const signatureValidator = require("./middlewares/signature-validator");
// 从环境变量读取配置（baseUrl 不含版本号，版本号在具体接口路径中指定）
const baseUrl = process.env.API_N8N_BASE_URL || "https://n8n.example.com";
const token = process.env.API_N8N_TOKEN || "mock_n8n_api_key";
module.exports = {
    // 基础配置（baseUrl 不含版本号，版本号在接口路径中指定）
    baseUrl,
    // 认证配置
    auth: {
        type: "apikey",
        token,
    },
    // 中间件配置 - 按 order 顺序执行
    middlewares: [
        {
            name: signatureValidator.name,
            handler: signatureValidator.handler,
            order: 1,
            enabled: false,
        },
    ],
    // 错误处理器
    errorHandler: (error, context) => {
        const { middleware } = context || {};
        return {
            success: false,
            error: {
                message: error.message,
                middleware,
                timestamp: new Date().toISOString(),
            },
        };
    },
    // 日志配置
    logger: {
        level: "info",
        enableConsole: true,
        customHandler: null,
    },
};
