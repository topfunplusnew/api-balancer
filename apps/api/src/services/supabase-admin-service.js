const { max, min } = require("mathjs");
const { SupabaseAdmin, Logger } = require("../config");

/**
 * Supabase Admin 服务
 */
class SupabaseAdminService {
  /**
   * 获取用户列表
   * @param {number} page - 页码
   * @param {number} perPage - 每页数量
   * @returns {Promise<object>} 用户列表
   */
  static async listUsers(page, perPage) {
    if (!SupabaseAdmin) {
      return {
        success: false,
        message: "Supabase Admin 未配置",
        error: {},
      };
    }

    const safePage = max(1, Number(page) || 1);
    const safePerPage = min(100, max(1, Number(perPage) || 20));

    const { data, error } = await SupabaseAdmin.auth.admin.listUsers({
      page: safePage,
      perPage: safePerPage,
    });

    if (error) {
      Logger.error(`Supabase 用户列表获取失败: ${error.message}`);
      return {
        success: false,
        message: "Supabase 用户列表获取失败",
        error,
      };
    }

    return {
      success: true,
      data,
    };
  }
}

module.exports = SupabaseAdminService;
