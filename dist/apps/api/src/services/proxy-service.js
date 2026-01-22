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
        // 执行中间件链（如订单校验等）
        let middlewareResult = {};
        if (apiConfig.runMiddlewares) {
            try {
                middlewareResult = await apiConfig.runMiddlewares({
                    parameters: params,
                    body: data,
                    headers,
                    path,
                    method,
                });
                // 中间件返回错误
                if (middlewareResult?.success === false) {
                    throw {
                        statusCode: StatusCodes.UNAUTHORIZED,
                        message: middlewareResult.error?.message || "中间件验证失败",
                        data: middlewareResult.error,
                    };
                }
                apiConfig.logger?.info("中间件执行完成", middlewareResult);
            }
            catch (error) {
                apiConfig.logger?.error("中间件执行失败", { error: error.message });
                throw {
                    statusCode: error.statusCode || StatusCodes.UNAUTHORIZED,
                    message: error.message || "中间件验证失败",
                    data: error.data || {},
                };
            }
        }
        const url = apiConfig.getUrl(path);
        // 使用配置中的固定 Token 进行鉴权
        const authHeaders = apiConfig.getAuthHeaders();
        // 合并请求头：先使用配置的鉴权信息，然后合并用户自定义的请求头
        const { authorization, ...otherHeaders } = headers;
        const requestConfig = {
            method: method.toUpperCase(),
            url,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
                ...otherHeaders,
            },
            params,
        };
        if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
            requestConfig.data = data;
        }
        // 打印详细的请求日志
        Logger.info("\n" + "=".repeat(80));
        Logger.info(`[Proxy] API代理请求 - ${apiName.toUpperCase()}`);
        Logger.info("=".repeat(80));
        Logger.info(`[Proxy] >>> 请求方法: ${method.toUpperCase()}`);
        Logger.info(`[Proxy] >>> 目标地址: ${url}`);
        Logger.info(`[Proxy] >>> 原始路径: ${path}`);
        // 打印鉴权头（隐藏敏感信息）
        const logHeaders = { ...requestConfig.headers };
        if (logHeaders.Authorization) {
            const authValue = logHeaders.Authorization;
            if (authValue.length > 30) {
                logHeaders.Authorization = authValue.substring(0, 20) + "..." + authValue.substring(authValue.length - 10);
            }
        }
        Logger.info(`[Proxy] >>> 请求头: ${JSON.stringify(logHeaders, null, 2)}`);
        if (Object.keys(params).length > 0) {
            Logger.info(`[Proxy] >>> 查询参数: ${JSON.stringify(params, null, 2)}`);
        }
        if (requestConfig.data) {
            const bodyStr = JSON.stringify(requestConfig.data, null, 2);
            Logger.info(`[Proxy] >>> 请求体: ${bodyStr.length > 500 ? bodyStr.substring(0, 500) + "...\n(内容已截断)" : bodyStr}`);
        }
        Logger.info("=".repeat(80));
        try {
            const response = await axios(requestConfig);
            // 打印响应日志
            Logger.info(`[Proxy] <<< 响应状态: ${response.status} ${response.statusText}`);
            const responseData = JSON.stringify(response.data, null, 2);
            if (responseData.length > 1000) {
                Logger.info(`[Proxy] <<< 响应数据 (前1000字符):\n${responseData.substring(0, 1000)}...\n(内容已截断，总长度: ${responseData.length})`);
            }
            else {
                Logger.info(`[Proxy] <<< 响应数据:\n${responseData}`);
            }
            Logger.info("=".repeat(80) + "\n");
            return {
                success: true,
                data: response.data,
                status: response.status,
                middlewareResult,
            };
        }
        catch (error) {
            Logger.error("\n" + "=".repeat(80));
            Logger.error(`[Proxy] ❌ 请求失败`);
            Logger.error("=".repeat(80));
            Logger.error(`[Proxy] <<< 错误信息: ${error.message}`);
            if (error.response) {
                Logger.error(`[Proxy] <<< HTTP状态码: ${error.response.status}`);
                Logger.error(`[Proxy] <<< 响应头: ${JSON.stringify(error.response.headers, null, 2)}`);
                Logger.error(`[Proxy] <<< 错误响应:\n${JSON.stringify(error.response.data, null, 2)}`);
                Logger.error("=".repeat(80) + "\n");
                throw {
                    statusCode: error.response.status,
                    message: error.response.data?.message || error.message,
                    data: error.response.data,
                };
            }
            else if (error.request) {
                Logger.error(`[Proxy] <<< 网络错误: 无法连接到目标服务器`);
                Logger.error(`[Proxy] <<< 请求配置: ${JSON.stringify({
                    url: error.config?.url,
                    method: error.config?.method,
                    timeout: error.config?.timeout
                }, null, 2)}`);
                Logger.error("=".repeat(80) + "\n");
                throw {
                    statusCode: StatusCodes.BAD_GATEWAY,
                    message: "无法连接到目标API服务器",
                };
            }
            else {
                Logger.error(`[Proxy] <<< 内部错误: ${error.message}`);
                Logger.error(`[Proxy] <<< 错误堆栈:\n${error.stack}`);
                Logger.error("=".repeat(80) + "\n");
                throw {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
            }
        }
    }
}
module.exports = ProxyService;
