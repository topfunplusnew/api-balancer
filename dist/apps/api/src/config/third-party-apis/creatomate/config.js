/**
 * Creatomate API 配置
 */
const orderValidator = require("./middlewares/order-validator");
module.exports = {
    // 基础配置
    baseUrl: "https://api.creatomate.com",
    version: "v2",
    // 认证配置
    auth: {
        type: "bearer",
        token: "52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e",
    },
    // 中间件配置 - 按 order 顺序执行
    middlewares: [
        {
            name: orderValidator.name,
            handler: orderValidator.handler,
            order: 1,
            enabled: true,
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
