const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { Supabase } = require("../config");
const { Logger } = require("../config");

/**
 * APIKEY 服务
 * 管理用户生成的持久化 APIKEY
 */
class ApiKeyService {
  /**
   * 生成新的 APIKEY
   * @param {string} username - 用户名
   * @param {string} name - APIKEY 名称（可选）
   * @param {Date} expiresAt - 过期时间（可选）
   * @returns {Promise<object>} APIKEY 信息
   */
  static async generateApiKey(username, name = null, expiresAt = null) {
    if (!Supabase) {
      throw new Error("Supabase未配置，请检查环境变量");
    }

    // 先获取用户信息
    const { data: userData, error: userError } = await Supabase
      .from("users")
      .select("id, username")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      throw {
        statusCode: StatusCodes.NOT_FOUND,
        message: "用户不存在",
      };
    }

    // 生成唯一的 APIKEY
    const apiKey = `sk_${crypto.randomBytes(32).toString("hex")}`;

    // 插入数据库
    const { data, error } = await Supabase
      .from("api_keys")
      .insert([
        {
          user_id: userData.id,
          username: username,
          api_key: apiKey,
          name: name || `API Key for ${username}`,
          expires_at: expiresAt,
        },
      ])
      .select()
      .single();

    if (error) {
      Logger.error(`创建 APIKEY 失败: ${error.message}`);
      throw {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "创建 APIKEY 失败",
      };
    }

    Logger.info(`用户 ${username} 成功创建 APIKEY: ${apiKey.substring(0, 20)}...`);

    return {
      id: data.id,
      api_key: data.api_key,
      name: data.name,
      created_at: data.created_at,
      expires_at: data.expires_at,
    };
  }

  /**
   * 验证 APIKEY 是否有效
   * @param {string} apiKey - APIKEY
   * @returns {Promise<object|null>} 返回用户信息，如果无效返回 null
   */
  static async verifyApiKey(apiKey) {
    if (!Supabase) {
      return null;
    }

    const { data, error } = await Supabase
      .from("api_keys")
      .select("id, user_id, username, name, is_active, expires_at")
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    // 检查是否过期
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // 更新最后使用时间
    await Supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);

    return {
      user_id: data.user_id,
      username: data.username,
      api_key_id: data.id,
      api_key_name: data.name,
    };
  }

  /**
   * 获取用户的所有 APIKEY
   * @param {string} username - 用户名
   * @returns {Promise<array>} APIKEY 列表
   */
  static async getUserApiKeys(username) {
    if (!Supabase) {
      return [];
    }

    const { data, error } = await Supabase
      .from("api_keys")
      .select("id, api_key, name, is_active, last_used_at, expires_at, created_at")
      .eq("username", username)
      .order("created_at", { ascending: false });

    if (error) {
      Logger.error(`获取用户 APIKEY 列表失败: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * 删除 APIKEY
   * @param {string} username - 用户名
   * @param {string} apiKeyId - APIKEY ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteApiKey(username, apiKeyId) {
    if (!Supabase) {
      return false;
    }

    const { error } = await Supabase
      .from("api_keys")
      .delete()
      .eq("id", apiKeyId)
      .eq("username", username);

    if (error) {
      Logger.error(`删除 APIKEY 失败: ${error.message}`);
      return false;
    }

    return true;
  }

  /**
   * 禁用/启用 APIKEY
   * @param {string} username - 用户名
   * @param {string} apiKeyId - APIKEY ID
   * @param {boolean} isActive - 是否激活
   * @returns {Promise<boolean>} 是否成功
   */
  static async toggleApiKey(username, apiKeyId, isActive) {
    if (!Supabase) {
      return false;
    }

    const { error } = await Supabase
      .from("api_keys")
      .update({ is_active: isActive })
      .eq("id", apiKeyId)
      .eq("username", username);

    if (error) {
      Logger.error(`更新 APIKEY 状态失败: ${error.message}`);
      return false;
    }

    return true;
  }
}

module.exports = ApiKeyService;
