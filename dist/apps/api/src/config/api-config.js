const fs = require("fs");
const path = require("path");
const { createLogger } = require("../middlewares/api-logger");
const { createRunner } = require("../middlewares/api-middleware-runner");
const apiConfigDir = path.join(__dirname, "third-party-apis");
/**
 * 加载API配置文件（支持 config.js 和 config.json）
 */
const loadConfigFile = (configDir) => {
    const jsPath = path.join(configDir, "config.js");
    const jsonPath = path.join(configDir, "config.json");
    if (fs.existsSync(jsPath)) {
        try {
            return require(jsPath);
        }
        catch (e) {
            console.warn(`加载配置失败: ${jsPath}`, e.message);
            return null;
        }
    }
    if (fs.existsSync(jsonPath)) {
        try {
            return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
        catch (e) {
            console.warn(`解析JSON失败: ${jsonPath}`);
            return null;
        }
    }
    return null;
};
/**
 * 构建API配置对象
 */
const buildApiConfig = (rawConfig, apiName) => {
    if (!rawConfig?.baseUrl)
        return null;
    const { baseUrl, version = "", auth = {}, middlewares = [], errorHandler, logger: loggerConfig = {} } = rawConfig;
    // 创建日志实例
    const logger = createLogger({ apiName, ...loggerConfig });
    // 创建中间件运行器
    const enabledMiddlewares = middlewares.filter((m) => m.enabled !== false);
    const middlewareRunner = createRunner(enabledMiddlewares, { logger, errorHandler });
    return {
        baseUrl,
        version,
        auth,
        logger,
        middlewareRunner,
        errorHandler,
        // 获取完整URL
        getUrl: (apiPath = "") => {
            const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
            const cleanPath = apiPath.startsWith("/") ? apiPath.slice(1) : apiPath;
            const versionPath = version ? `${version}/` : "";
            return cleanPath ? `${cleanBase}/${versionPath}${cleanPath}` : version ? `${cleanBase}/${version}` : cleanBase;
        },
        // 获取认证头
        getAuthHeaders: () => {
            const { type, token } = auth;
            if (!token)
                return {};
            if (type === "bearer") {
                return { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` };
            }
            if (type === "apikey") {
                return { "X-API-Key": token };
            }
            return { Authorization: token };
        },
        // 执行中间件链
        runMiddlewares: (context) => middlewareRunner.run(context),
    };
};
/**
 * 加载所有API配置
 */
const loadApiConfigs = () => {
    const config = {};
    if (!fs.existsSync(apiConfigDir))
        return config;
    const entries = fs.readdirSync(apiConfigDir, { withFileTypes: true });
    entries
        .filter((e) => e.isDirectory())
        .forEach((entry) => {
        const apiName = entry.name.toLowerCase();
        const configPath = path.join(apiConfigDir, entry.name);
        const rawConfig = loadConfigFile(configPath);
        const apiConfig = buildApiConfig(rawConfig, apiName);
        if (apiConfig)
            config[apiName] = apiConfig;
    });
    return config;
};
module.exports = loadApiConfigs();
