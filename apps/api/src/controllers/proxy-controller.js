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
   * 转发请求到Coze API
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async cozeProxy(req, res) {
    req.params.apiName = "coze";
    return ProxyController.genericProxy(req, res);
  }

  /**
   * 转发请求到n8n API
   * 注意：用户的 Authorization header 不会被转发，使用 .env 中配置的固定 Token
   */
  static async n8nProxy(req, res) {
    req.params.apiName = "n8n";
    return ProxyController.genericProxy(req, res);
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
