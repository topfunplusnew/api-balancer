const { StatusCodes } = require("http-status-codes");
const { ApiKeyService } = require("../services");
const { Logger } = require("../config");

/**
 * APIKEY 控制器
 */
class ApiKeyController {
  /**
   * 生成新的 APIKEY
   * 需要先通过 Bearer Token 鉴权
   */
  static async createApiKey(req, res) {
    try {
      const { name, expires_at } = req.body;
      const username = req.apiKey?.username;

      if (!username) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "未授权",
          error: {},
        });
      }

      const apiKeyInfo = await ApiKeyService.generateApiKey(
        username,
        name,
        expires_at ? new Date(expires_at) : null
      );

      return res.status(StatusCodes.CREATED).json({
        success: true,
        data: {
          ...apiKeyInfo,
          message: "APIKEY 已生成，请妥善保管，此密钥只会显示一次",
        },
      });
    } catch (error) {
      Logger.error(`创建 APIKEY 失败: ${error.message}`);
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "创建 APIKEY 失败",
        error: error.data || {},
      });
    }
  }

  /**
   * 获取当前用户的所有 APIKEY 列表
   */
  static async listApiKeys(req, res) {
    try {
      const username = req.apiKey?.username;

      if (!username) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "未授权",
          error: {},
        });
      }

      const apiKeys = await ApiKeyService.getUserApiKeys(username);

      // 隐藏完整的 APIKEY，只显示前8位和后4位
      const maskedApiKeys = apiKeys.map((key) => ({
        ...key,
        api_key: `${key.api_key.substring(0, 8)}...${key.api_key.substring(key.api_key.length - 4)}`,
      }));

      return res.status(StatusCodes.OK).json({
        success: true,
        data: maskedApiKeys,
      });
    } catch (error) {
      Logger.error(`获取 APIKEY 列表失败: ${error.message}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "获取 APIKEY 列表失败",
        error: {},
      });
    }
  }

  /**
   * 删除 APIKEY
   */
  static async deleteApiKey(req, res) {
    try {
      const username = req.apiKey?.username;
      const { id } = req.params;

      if (!username) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "未授权",
          error: {},
        });
      }

      const success = await ApiKeyService.deleteApiKey(username, id);

      if (!success) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "APIKEY 不存在或无权删除",
          error: {},
        });
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "APIKEY 已删除",
      });
    } catch (error) {
      Logger.error(`删除 APIKEY 失败: ${error.message}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "删除 APIKEY 失败",
        error: {},
      });
    }
  }

  /**
   * 禁用/启用 APIKEY
   */
  static async toggleApiKey(req, res) {
    try {
      const username = req.apiKey?.username;
      const { id } = req.params;
      const { is_active } = req.body;

      if (!username) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "未授权",
          error: {},
        });
      }

      if (typeof is_active !== "boolean") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "is_active 必须是布尔值",
          error: {},
        });
      }

      const success = await ApiKeyService.toggleApiKey(username, id, is_active);

      if (!success) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "APIKEY 不存在或无权操作",
          error: {},
        });
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: `APIKEY 已${is_active ? "启用" : "禁用"}`,
      });
    } catch (error) {
      Logger.error(`更新 APIKEY 状态失败: ${error.message}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "更新 APIKEY 状态失败",
        error: {},
      });
    }
  }
}

module.exports = ApiKeyController;
