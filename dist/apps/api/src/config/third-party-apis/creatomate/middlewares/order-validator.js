/**
 * 订单校验鉴权中间件
 * 通过请求第三方webhook验证订单有效性
 */
const ORDER_VALIDATOR_CONFIG = {
    url: "http://42.193.124.39:3030/api/sign",
    method: "POST",
    timeout: 10000,
};
/**
 * 请求webhook进行订单验证
 */
const requestWebhook = async (params) => {
    const { access_key, secret_key, order_token } = params;
    const response = await fetch(ORDER_VALIDATOR_CONFIG.url, {
        method: ORDER_VALIDATOR_CONFIG.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_key, secret_key, order_token }),
        signal: AbortSignal.timeout(ORDER_VALIDATOR_CONFIG.timeout),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorMsg = `[${response.status}] ${body?.error || "订单验证失败"}`;
        throw new Error(errorMsg);
    }
    return {
        access_key: body?.access_key,
        secret_key: body?.secret_key,
    };
};
/**
 * 订单校验中间件处理函数
 * @param {Object} context - 包含 parameters 的上下文对象
 * @returns {Object} 验证结果，包含 access_key 和 secret_key
 */
const handler = async (context) => {
    const { parameters = {} } = context;
    if (!parameters.access_key || !parameters.secret_key || !parameters.order_token) {
        throw new Error("缺少必要的验证参数: access_key, secret_key, order_token");
    }
    const result = await requestWebhook(parameters);
    return {
        auth: {
            access_key: result.access_key,
            secret_key: result.secret_key,
            validated: true,
        },
    };
};
module.exports = {
    name: "orderValidator",
    handler,
    config: ORDER_VALIDATOR_CONFIG,
};
