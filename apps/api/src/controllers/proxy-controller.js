const { StatusCodes } = require("http-status-codes");
const { ProxyService } = require("../services");

/**
 * 转发控制器
 */
class ProxyController {
  /**
   * 转发请求到Creatomate API
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async creatomateProxy(req, res) {
    const { path } = req.params;
    const method = req.method;
    const data = Object.keys(req.body).length > 0 ? req.body : null;
    // 不转发用户的 Authorization header，使用配置的固定 Token
    const headers = {};
    const params = req.query;

    try {
      const result = await ProxyService.proxyRequest("creatomate", path, method, data, headers, params);
      return res.status(result.status || StatusCodes.OK).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: error.data || {},
      });
    }
  }

  /**
   * 获取 Creatomate 项目中的所有模板列表
   * GET /api/v1/proxy/creatomate/templates
   * 
   * 实际转发到: GET https://api.creatomate.com/v1/templates
   */
  static async getCreatomateTemplates(req, res) {
    const params = req.query;

    console.log("\n" + "=".repeat(80));
    console.log(`[Controller] 收到请求: ${req.method} ${req.originalUrl}`);
    console.log(`[Controller] 路由路径: /proxy/creatomate/templates`);
    console.log(`[Controller] 查询参数:`, params);
    console.log("=".repeat(80));

    try {
      const result = await ProxyService.proxyRequest("creatomate", "templates", "GET", null, {}, params);
      return res.status(result.status || StatusCodes.OK).json({
        success: true,
        message: "获取模板列表成功",
        data: result.data,
      });
    } catch (error) {
      console.error(`[Controller] 请求失败:`, error.message);
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "获取模板列表失败",
        error: error.data || {},
      });
    }
  }

  /**
   * 转发请求到 Coze API
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async cozeProxy(req, res) {
    const { path } = req.params;
    const method = req.method;
    const data = Object.keys(req.body).length > 0 ? req.body : null;
    // 不转发用户的 Authorization header，使用配置的固定 Token
    const headers = {};
    const params = req.query;

    try {
      const result = await ProxyService.proxyRequest("coze", path, method, data, headers, params);
      return res.status(result.status || StatusCodes.OK).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: error.data || {},
      });
    }
  }

  /**
   * 转发请求到 n8n API
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async n8nProxy(req, res) {
    const { path } = req.params;
    const method = req.method;
    const data = Object.keys(req.body).length > 0 ? req.body : null;
    // 不转发用户的 Authorization header，使用配置的固定 Token
    const headers = {};
    const params = req.query;

    try {
      const result = await ProxyService.proxyRequest("n8n", path, method, data, headers, params);
      return res.status(result.status || StatusCodes.OK).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: error.data || {},
      });
    }
  }

  /**
   * 通用转发方法（支持动态API名称）
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async genericProxy(req, res) {
    const { apiName, path } = req.params;
    const method = req.method;
    const data = Object.keys(req.body).length > 0 ? req.body : null;
    // 不转发用户的 Authorization header，使用配置的固定 Token
    const headers = {};
    const params = req.query;

    try {
      const result = await ProxyService.proxyRequest(apiName, path, method, data, headers, params);
      return res.status(result.status || StatusCodes.OK).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: error.data || {},
      });
    }
  }
}

module.exports = ProxyController;
