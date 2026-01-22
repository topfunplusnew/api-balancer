/**
 * Creatomate API 配置
 */
const orderValidator = require("./middlewares/order-validator");
// 从环境变量读取配置，如果没有则使用默认值
const baseUrl = process.env.API_CREATOMATE_BASE_URL || "https://api.creatomate.com";
const version = process.env.API_CREATOMATE_VERSION || "v1";
const token = process.env.API_CREATOMATE_TOKEN || "52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e";
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
            name: orderValidator.name,
            handler: orderValidator.handler,
            order: 1,
            enabled: false,
        },
    ],
    // 错误处理器
    errorHandler: (error, context) => {
        const { middleware, context: ctx } = context || {};
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
