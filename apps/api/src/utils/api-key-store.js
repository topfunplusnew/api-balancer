const { getRedis } = require("../config");
// 延迟加载 Logger 避免循环依赖
const getLogger = () => {
  try {
    return require("../config").Logger;
  } catch (error) {
    return {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };
  }
};

/**
 * API Key存储工具
 * 使用Redis存储临时Token，key为access_key，value为username
 * 如果Redis不可用，则回退到内存Map存储
 */
class ApiKeyStore {
  constructor() {
    this.memoryStore = new Map(); // 内存存储作为后备
    this.useRedis = false;
    this.redis = null;
    this.keyPrefix = "api_key:";
    this.defaultTTL = 24 * 60 * 60; // 默认24小时过期
    this.init();
  }

  /**
   * 初始化Redis连接
   */
  async init() {
    const Logger = getLogger();
    try {
      this.redis = getRedis();
      if (this.redis) {
        // 测试连接是否可用
        try {
          await this.redis.ping();
          this.useRedis = true;
          Logger.info("API Key存储已切换到Redis");
        } catch (connectError) {
          // 如果连接失败，尝试连接
          try {
            if (this.redis.status === "end" || this.redis.status === "close") {
              await this.redis.connect();
            }
            await this.redis.ping();
            this.useRedis = true;
            Logger.info("API Key存储已切换到Redis");
          } catch (error) {
            Logger.warn(`Redis连接失败，使用内存存储: ${error.message}`);
            this.useRedis = false;
          }
        }
      } else {
        Logger.warn("Redis不可用，使用内存存储（重启后数据会丢失）");
      }
    } catch (error) {
      Logger.warn(`Redis初始化失败，使用内存存储: ${error.message}`);
      this.useRedis = false;
    }
  }

  /**
   * 获取Redis key
   */
  getRedisKey(accessKey) {
    return `${this.keyPrefix}${accessKey}`;
  }

  /**
   * 设置API key
   * @param {string} accessKey - 访问密钥
   * @param {string} username - 用户名
   * @param {number} ttl - 过期时间（秒），默认24小时
   */
  async set(accessKey, username, ttl = this.defaultTTL) {
    if (this.useRedis && this.redis) {
      try {
        const key = this.getRedisKey(accessKey);
        await this.redis.setex(key, ttl, username);
        return;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis设置失败，回退到内存存储: ${error.message}`);
        this.useRedis = false;
      }
    }
    // 回退到内存存储
    this.memoryStore.set(accessKey, username);
  }

  /**
   * 获取API key
   * @param {string} accessKey - 访问密钥
   * @returns {Promise<string|undefined>} 返回username，如果不存在返回undefined
   */
  async get(accessKey) {
    if (this.useRedis && this.redis) {
      try {
        const key = this.getRedisKey(accessKey);
        const username = await this.redis.get(key);
        return username || undefined;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis获取失败，回退到内存存储: ${error.message}`);
        this.useRedis = false;
      }
    }
    // 回退到内存存储
    return this.memoryStore.get(accessKey);
  }

  /**
   * 检查API key是否存在
   * @param {string} accessKey - 访问密钥
   * @returns {Promise<boolean>}
   */
  async has(accessKey) {
    if (this.useRedis && this.redis) {
      try {
        const key = this.getRedisKey(accessKey);
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis检查失败，回退到内存存储: ${error.message}`);
        this.useRedis = false;
      }
    }
    // 回退到内存存储
    return this.memoryStore.has(accessKey);
  }

  /**
   * 删除API key
   * @param {string} accessKey - 访问密钥
   * @returns {Promise<boolean>}
   */
  async delete(accessKey) {
    if (this.useRedis && this.redis) {
      try {
        const key = this.getRedisKey(accessKey);
        const result = await this.redis.del(key);
        return result > 0;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis删除失败，回退到内存存储: ${error.message}`);
        this.useRedis = false;
      }
    }
    // 回退到内存存储
    return this.memoryStore.delete(accessKey);
  }

  /**
   * 清空所有API key
   */
  async clear() {
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys(`${this.keyPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis清空失败，回退到内存存储: ${error.message}`);
        this.useRedis = false;
      }
    }
    // 回退到内存存储
    this.memoryStore.clear();
  }

  /**
   * 延长API key的过期时间
   * @param {string} accessKey - 访问密钥
   * @param {number} ttl - 新的过期时间（秒）
   */
  async expire(accessKey, ttl = this.defaultTTL) {
    if (this.useRedis && this.redis) {
      try {
        const key = this.getRedisKey(accessKey);
        await this.redis.expire(key, ttl);
        return;
      } catch (error) {
        const Logger = getLogger();
        Logger.error(`Redis延长过期时间失败: ${error.message}`);
      }
    }
    // 内存存储不支持过期时间
  }
}

// 导出单例实例
module.exports = new ApiKeyStore();
