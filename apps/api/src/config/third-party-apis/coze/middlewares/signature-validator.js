/**
 * Coze 签名校验中间件（架子）
 */
const SIGNATURE_CONFIG = {
  headerName: "x-coze-signature",
  secret: process.env.API_COZE_SIGNATURE_SECRET || "",
};

/**
 * @typedef {Object} MiddlewareContext
 * @property {Object} headers - 请求头
 */

/**
 * @typedef {Object} AuthResult
 * @property {Object} auth - 验证结果
 * @property {boolean} auth.validated - 验证状态
 */

/**
 * 签名校验处理函数
 * @param {MiddlewareContext} context - 中间件上下文对象
 * @returns {Promise<AuthResult>} 验证结果
 */
const handler = async (context) => {
  const headers = context?.headers || {};
  const signature =
    headers[SIGNATURE_CONFIG.headerName] || headers[SIGNATURE_CONFIG.headerName.toLowerCase()];
  const errorMessage = !SIGNATURE_CONFIG.secret
    ? "签名密钥未配置"
    : !signature
    ? "缺少签名头"
    : "";

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return {
    auth: {
      validated: true,
    },
  };
};

module.exports = {
  name: "cozeSignatureValidator",
  handler,
  config: SIGNATURE_CONFIG,
};
