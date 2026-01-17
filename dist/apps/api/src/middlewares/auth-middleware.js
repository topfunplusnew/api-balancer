const { StatusCodes } = require("http-status-codes");
const { apiKeyStore } = require("../utils");
const { ApiKeyService } = require("../services");
const { Logger } = require("../config");
/**
 * API Key鉴权中间件
 * 支持两种鉴权方式：
 * 1. Bearer Token: Authorization: Bearer {access_key} (临时token)
 * 2. APIKEY: X-API-Key: {api_key} 或 query参数 ?api_key={api_key} (持久化key)
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const apiKeyHeader = req.headers["x-api-key"] || req.query.api_key;
        // 优先使用 Bearer Token
        if (authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                const accessKey = parts[1];
                if (accessKey && (await apiKeyStore.has(accessKey))) {
                    // Bearer Token 验证成功
                    const username = await apiKeyStore.get(accessKey);
                    req.apiKey = {
                        access_key: accessKey,
                        username: username,
                        type: "bearer_token",
                    };
                    return next();
                }
            }
        }
        // 如果没有 Bearer Token 或验证失败，尝试使用 APIKEY
        if (apiKeyHeader) {
            const apiKeyInfo = await ApiKeyService.verifyApiKey(apiKeyHeader);
            if (apiKeyInfo) {
                // APIKEY 验证成功
                req.apiKey = {
                    api_key: apiKeyHeader,
                    username: apiKeyInfo.username,
                    user_id: apiKeyInfo.user_id,
                    api_key_id: apiKeyInfo.api_key_id,
                    api_key_name: apiKeyInfo.api_key_name,
                    type: "api_key",
                };
                return next();
            }
        }
        // 两种鉴权方式都失败
        Logger.warn(`鉴权失败: 缺少有效的鉴权信息`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "鉴权失败，请提供有效的 Bearer Token 或 APIKEY",
            error: {},
        });
    }
    catch (error) {
        Logger.error(`鉴权中间件错误: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "鉴权验证失败",
            error: {},
        });
    }
};
module.exports = authMiddleware;
