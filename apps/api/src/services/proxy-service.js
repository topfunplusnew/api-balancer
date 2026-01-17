const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { ApiConfig } = require("../config");
const { Logger } = require("../config");

/**
 * 转发服务
 * 将请求转发到配置的外部API
 */
class ProxyService {
  /**
   * 转发请求到指定的API
   * @param {string} apiName - API名称（配置中的key）
   * @param {string} path - API路径（不包含baseUrl和version）
   * @param {string} method - HTTP方法
   * @param {object} data - 请求体数据
   * @param {object} headers - 自定义请求头（不会覆盖配置的鉴权信息）
   * @param {object} params - URL查询参数
   * @returns {Promise<object>} 响应数据
   */
  static async proxyRequest(apiName, path, method = "GET", data = null, headers = {}, params = {}) {
    const apiConfig = ApiConfig[apiName];

    if (!apiConfig) {
      throw {
        statusCode: StatusCodes.BAD_REQUEST,
        message: `API配置不存在: ${apiName}`,
      };
    }

    const url = apiConfig.getUrl(path);
    
    // 使用配置中的固定 Token 进行鉴权
    const authHeaders = apiConfig.getAuthHeaders();
    
    // 合并请求头：先使用配置的鉴权信息，然后合并用户自定义的请求头
    // 注意：用户的 Authorization header 不会被转发，使用配置的固定 Token
    const { authorization, ...otherHeaders } = headers;
    
    const requestConfig = {
      method: method.toUpperCase(),
      url,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders, // 使用配置的固定 Token
        ...otherHeaders, // 其他自定义请求头
      },
      params,
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      requestConfig.data = data;
    }

    try {
      Logger.info(`转发请求: ${method} ${url} (使用配置的固定Token)`);
      const response = await axios(requestConfig);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      Logger.error(`转发请求失败: ${error.message}`);
      
      if (error.response) {
        // API返回了错误响应
        throw {
          statusCode: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      } else if (error.request) {
        // 请求已发出但没有收到响应
        throw {
          statusCode: StatusCodes.BAD_GATEWAY,
          message: "无法连接到目标API服务器",
        };
      } else {
        // 其他错误
        throw {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
    }
  }
}

module.exports = ProxyService;
