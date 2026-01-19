/**
 * 订单校验鉴权中间件
 * 通过请求第三方webhook验证订单有效性
 */
const ORDER_VALIDATOR_CONFIG = {
  baseUrl: "https://hook.us2.make.com/a1c31elkblhoprqwh639a81ugpf9n33g",
  method: "GET",
  timeout: 10000,
};

/**
 * 请求webhook进行订单验证
 * @param {string} token - 订单令牌
 * @returns {Promise<{validated: boolean}>} 验证结果
 * @throws {Error} 验证失败时抛出错误
 */
const requestWebhook = async (token) => {
  const url = `${ORDER_VALIDATOR_CONFIG.baseUrl}?token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    method: ORDER_VALIDATOR_CONFIG.method,
    signal: AbortSignal.timeout(ORDER_VALIDATOR_CONFIG.timeout),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = `[${response.status}] ${body?.error || "订单验证失败"}`;
    throw new Error(errorMsg);
  }

  return { validated: true };
};

/**
 * @typedef {Object} MiddlewareContext
 * @property {Object} parameters - URL查询参数
 * @property {string} parameters.token - 订单令牌
 * @property {Object} body - 请求体数据
 * @property {Object} headers - 请求头
 * @property {string} path - API路径
 * @property {string} method - HTTP方法
 */

/**
 * @typedef {Object} AuthResult
 * @property {Object} auth - 验证结果
 * @property {boolean} auth.validated - 验证状态
 */

/**
 * 订单校验中间件处理函数
 * @param {MiddlewareContext} context - 中间件上下文对象
 * @returns {Promise<AuthResult>} 验证结果
 * @throws {Error} 缺少必要参数或验证失败时抛出错误
 */
const handler = async (context) => {
  const { parameters = {} } = context;

  if (!parameters.token) {
    throw new Error("缺少必要的验证参数: token");
  }

  const result = await requestWebhook(parameters.token);

  return {
    auth: {
      validated: result.validated,
    },
  };
};

module.exports = {
  name: "orderValidator",
  handler,
  config: ORDER_VALIDATOR_CONFIG,
};
