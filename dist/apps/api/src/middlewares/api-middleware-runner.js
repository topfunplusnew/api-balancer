/**
 * 第三方API中间件运行器
 * 按顺序执行配置的中间件链
 */
class MiddlewareRunner {
    constructor(middlewares = [], options = {}) {
        this.middlewares = this._sortMiddlewares(middlewares);
        this.logger = options.logger || null;
        this.errorHandler = options.errorHandler || null;
    }
    // 按order排序中间件
    _sortMiddlewares(middlewares) {
        return [...middlewares].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    // 执行中间件链
    async run(context = {}) {
        let currentContext = { ...context };
        for (const middleware of this.middlewares) {
            if (!middleware.handler || typeof middleware.handler !== "function") {
                continue;
            }
            this.logger?.logMiddleware(middleware.name, "开始执行");
            try {
                const result = await middleware.handler(currentContext);
                currentContext = { ...currentContext, ...result };
                this.logger?.logMiddleware(middleware.name, "执行成功", { result });
            }
            catch (error) {
                this.logger?.logMiddleware(middleware.name, "执行失败", { error: error.message });
                if (this.errorHandler) {
                    return this.errorHandler(error, { middleware: middleware.name, context: currentContext });
                }
                throw error;
            }
        }
        return currentContext;
    }
}
const createRunner = (middlewares, options) => new MiddlewareRunner(middlewares, options);
module.exports = { MiddlewareRunner, createRunner };
