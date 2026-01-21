/**
 * Coze API 配置
 */
const signatureValidator = require("./middlewares/signature-validator");
const baseUrl = process.env.API_COZE_BASE_URL || "https://api.coze.com";
const version = process.env.API_COZE_VERSION || "v1";
const token = process.env.API_COZE_TOKEN || "mock_coze_token";
module.exports = {
    // 基础配置
    baseUrl,
    version,
    // 认证配置
    auth: {
        type: "bearer",
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
