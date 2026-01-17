const { StatusCodes } = require("http-status-codes");
const { AuthService } = require("../services");
const { apiKeyStore } = require("../utils");
const { Logger } = require("../config");
/**
 * 鉴权控制器
 */
class AuthController {
    /**
     * 获取API key
     * 需要提供username和password，系统验证后生成API key
     */
    static async getApiKey(req, res) {
        try {
            const { username, password } = req.body;
            // 验证必填字段
            if (!username || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "缺少必填字段: username 和 password",
                    error: {},
                });
            }
            // 调用本系统鉴权服务（基于Supabase数据库）
            const result = await AuthService.getApiKey(username, password);
            if (!result.success || !result.data) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "获取API key失败",
                    error: {},
                });
            }
            const { access_key: accessKey } = result.data;
            if (!accessKey) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "API key生成失败",
                    error: {},
                });
            }
            // 存储API key到Redis（如果可用）或内存中（使用username作为标识）
            await apiKeyStore.set(accessKey, username);
            Logger.info(`API key已生成并存储: ${accessKey.substring(0, 20)}...`);
            // 返回API key
            return res.status(StatusCodes.OK).json({
                success: true,
                data: {
                    access_key: accessKey,
                    message: "API key已生成，请使用access_key作为Bearer token进行鉴权",
                },
            });
        }
        catch (error) {
            Logger.error(`获取API key失败: ${error.message}`);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "获取API key失败",
                error: error.data || {},
            });
        }
    }
}
module.exports = AuthController;
