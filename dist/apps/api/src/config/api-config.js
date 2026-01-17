/**
 * API配置管理
 * 支持通过环境变量动态配置多个API
 * 格式：API_{NAME}_BASE_URL、API_{NAME}_VERSION、API_{NAME}_TOKEN 或 API_{NAME}_API_KEY
 */
const getApiConfig = () => {
    const config = {};
    const apiNames = new Set();
    // 从环境变量中提取所有API配置
    Object.keys(process.env).forEach((key) => {
        if (key.startsWith("API_") && key.endsWith("_BASE_URL")) {
            const apiName = key.replace("API_", "").replace("_BASE_URL", "").toLowerCase();
            apiNames.add(apiName);
        }
    });
    // 为每个API构建配置对象
    apiNames.forEach((name) => {
        const baseUrlKey = `API_${name.toUpperCase()}_BASE_URL`;
        const versionKey = `API_${name.toUpperCase()}_VERSION`;
        const tokenKey = `API_${name.toUpperCase()}_TOKEN`;
        const apiKeyKey = `API_${name.toUpperCase()}_API_KEY`;
        const baseUrl = process.env[baseUrlKey];
        const version = process.env[versionKey] || "";
        // 优先使用 TOKEN，如果没有则使用 API_KEY
        const authToken = process.env[tokenKey] || process.env[apiKeyKey] || "";
        if (baseUrl) {
            config[name] = {
                baseUrl,
                version,
                authToken,
                // 构建完整的API地址
                getUrl: (path = "") => {
                    // 清理baseUrl末尾的斜杠
                    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
                    // 清理path开头的斜杠
                    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
                    if (!cleanPath) {
                        // 如果path为空，只返回baseUrl和version
                        return version ? `${cleanBaseUrl}/${version}` : cleanBaseUrl;
                    }
                    // 构建完整URL
                    const versionPath = version ? `${version}/` : "";
                    return `${cleanBaseUrl}/${versionPath}${cleanPath}`;
                },
                // 获取鉴权请求头
                getAuthHeaders: () => {
                    if (!authToken) {
                        return {};
                    }
                    // 如果 Token 以 Bearer 开头，直接使用；否则添加 Bearer 前缀
                    if (authToken.startsWith("Bearer ")) {
                        return { Authorization: authToken };
                    }
                    return { Authorization: `Bearer ${authToken}` };
                },
            };
        }
    });
    return config;
};
module.exports = getApiConfig();
