let Redis = null;
try {
    // eslint-disable-next-line global-require
    Redis = require("ioredis");
}
catch (error) {
    Redis = null;
}
let redis = null;
// 延迟加载 Logger 避免循环依赖
const getLogger = () => {
    try {
        return require("./logger-config");
    }
    catch (error) {
        // 如果 Logger 不可用，返回一个简单的 console logger
        return {
            info: console.log,
            warn: console.warn,
            error: console.error,
        };
    }
};
/**
 * Redis配置
 * 从环境变量读取配置，如果未配置则返回null
 */
const getRedisConfig = () => {
    const host = process.env.REDIS_HOST || "localhost";
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD || null;
    const db = process.env.REDIS_DB || 0;
    return {
        host,
        port: parseInt(port, 10),
        password: password || undefined,
        db: parseInt(db, 10),
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    };
};
/**
 * 初始化Redis连接
 */
const initRedis = () => {
    if (redis) {
        return redis;
    }
    // 如果 ioredis 未安装，返回 null
    if (!Redis) {
        const Logger = getLogger();
        Logger.warn("ioredis 未安装，Redis 功能不可用。请运行: npm install ioredis");
        return null;
    }
    const config = getRedisConfig();
    const Logger = getLogger();
    try {
        redis = new Redis(config);
        redis.on("connect", () => {
            Logger.info("Redis连接成功");
        });
        redis.on("ready", () => {
            Logger.info("Redis准备就绪");
        });
        redis.on("error", (error) => {
            Logger.error(`Redis连接错误: ${error.message}`);
        });
        redis.on("close", () => {
            Logger.warn("Redis连接已关闭");
        });
        redis.on("reconnecting", () => {
            Logger.info("Redis正在重连...");
        });
        // 尝试连接（如果使用lazyConnect）
        if (config.lazyConnect) {
            redis.connect().catch((error) => {
                Logger.warn(`Redis延迟连接失败: ${error.message}`);
            });
        }
        return redis;
    }
    catch (error) {
        Logger.error(`Redis初始化失败: ${error.message}`);
        return null;
    }
};
/**
 * 获取Redis实例
 */
const getRedis = () => {
    if (!redis) {
        return initRedis();
    }
    return redis;
};
/**
 * 关闭Redis连接
 */
const closeRedis = async () => {
    if (redis) {
        const Logger = getLogger();
        await redis.quit();
        redis = null;
        Logger.info("Redis连接已关闭");
    }
};
module.exports = {
    getRedis,
    closeRedis,
    initRedis,
};
