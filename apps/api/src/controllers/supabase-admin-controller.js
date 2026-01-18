const { StatusCodes } = require("http-status-codes");
const { SupabaseAdminService } = require("../services");

/**
 * Supabase Admin 控制器
 */
class SupabaseAdminController {
  /**
   * 获取用户列表
   */
  static async listUsers(req, res) {
    const { page, per_page: perPage } = req.query;
    const result = await SupabaseAdminService.listUsers(page, perPage);

    return result?.success
      ? res.status(StatusCodes.OK).json(result)
      : res.status(StatusCodes.BAD_REQUEST).json(result);
  }
}

module.exports = SupabaseAdminController;
