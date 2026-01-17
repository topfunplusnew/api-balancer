const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { userStore } = require("../utils");
const { Logger } = require("../config");

/**
 * 鉴权服务
 * 基于Supabase数据库的用户鉴权服务
 */
class AuthService {
  /**
   * 验证用户并生成API key
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<object>} 返回access_key
   */
  static async getApiKey(username, password) {
    try {
      // 验证用户名和密码
      const isValid = await userStore.verifyUser(username, password);
      if (!isValid) {
        throw {
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "用户名或密码错误",
        };
      }

      // 生成API key（使用用户名和时间戳生成唯一key）
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(16).toString("hex");
      const accessKey = `${username}_${timestamp}_${randomStr}`;

      Logger.info(`用户 ${username} 成功获取API key`);

      return {
        success: true,
        data: {
          access_key: accessKey,
        },
      };
    } catch (error) {
      Logger.error(`用户鉴权失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建用户（用于初始化或管理）
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<object>} 用户信息
   */
  static async createUser(username, password) {
    try {
      const userExists = await userStore.hasUser(username);
      if (userExists) {
        throw {
          statusCode: StatusCodes.CONFLICT,
          message: "用户已存在",
        };
      }

      return await userStore.createUser(username, password);
    } catch (error) {
      Logger.error(`创建用户失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AuthService;
