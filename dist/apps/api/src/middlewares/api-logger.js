/**
 * 第三方API日志服务
 * 提供统一的日志记录能力
 */
class ApiLogger {
    constructor(options = {}) {
        this.apiName = options.apiName || "unknown";
        this.level = options.level || "info";
        this.enableConsole = options.enableConsole !== false;
        this.customHandler = options.customHandler || null;
    }
    _formatMessage(level, message, context = {}) {
        return {
            timestamp: new Date().toISOString(),
            level,
            api: this.apiName,
            message,
            ...context,
        };
    }
    _log(level, message, context = {}) {
        const logEntry = this._formatMessage(level, message, context);
        if (this.customHandler) {
            this.customHandler(logEntry);
        }
        if (this.enableConsole) {
            const logFn = console[level] || console.log;
            logFn(`[${logEntry.timestamp}] [${level.toUpperCase()}] [${this.apiName}] ${message}`, context);
        }
        return logEntry;
    }
    info(message, context) {
        return this._log("info", message, context);
    }
    warn(message, context) {
        return this._log("warn", message, context);
    }
    error(message, context) {
        return this._log("error", message, context);
    }
    debug(message, context) {
        return this.level === "debug" ? this._log("debug", message, context) : null;
    }
    // 记录API请求
    logRequest(method, url, data = {}) {
        return this.info(`API请求: ${method} ${url}`, { requestData: data });
    }
    // 记录API响应
    logResponse(method, url, status, duration) {
        return this.info(`API响应: ${method} ${url} [${status}] ${duration}ms`, { status, duration });
    }
    // 记录中间件执行
    logMiddleware(middlewareName, action, context = {}) {
        return this.debug(`中间件 [${middlewareName}] ${action}`, context);
    }
}
const createLogger = (options) => new ApiLogger(options);
module.exports = { ApiLogger, createLogger };
