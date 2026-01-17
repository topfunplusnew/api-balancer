const crypto = require("crypto");
const { Supabase } = require("../config");
const { Logger } = require("../config");
/**
 * 用户存储工具
 * 使用Supabase数据库存储用户信息
 */
class UserStore {
    /**
     * 加密密码
     * @param {string} password - 明文密码
     * @returns {string} 加密后的密码
     */
    hashPassword(password) {
        return crypto.createHash("sha256").update(password).digest("hex");
    }
    /**
     * 创建用户
     * @param {string} username - 用户名
     * @param {string} password - 密码（明文，内部会加密存储）
     * @returns {Promise<object>} 用户信息
     */
    async createUser(username, password) {
        if (!Supabase) {
            throw new Error("Supabase未配置，请检查环境变量");
        }
        const hashedPassword = this.hashPassword(password);
        const { data, error } = await Supabase
            .from("users")
            .insert([
            {
                username,
                password: hashedPassword,
            },
        ])
            .select()
            .single();
        if (error) {
            if (error.code === "23505") {
                // 唯一约束违反（用户已存在）
                throw {
                    statusCode: 409,
                    message: "用户已存在",
                };
            }
            Logger.error(`创建用户失败: ${error.message}`);
            throw {
                statusCode: 500,
                message: "创建用户失败",
            };
        }
        return {
            username: data.username,
            createdAt: data.created_at,
        };
    }
    /**
     * 验证用户
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<boolean>} 验证是否成功
     */
    async verifyUser(username, password) {
        if (!Supabase) {
            throw new Error("Supabase未配置，请检查环境变量");
        }
        const hashedPassword = this.hashPassword(password);
        const { data, error } = await Supabase
            .from("users")
            .select("username, password")
            .eq("username", username)
            .single();
        if (error || !data) {
            return false;
        }
        return data.password === hashedPassword;
    }
    /**
     * 检查用户是否存在
     * @param {string} username - 用户名
     * @returns {Promise<boolean>}
     */
    async hasUser(username) {
        if (!Supabase) {
            return false;
        }
        const { data, error } = await Supabase
            .from("users")
            .select("username")
            .eq("username", username)
            .single();
        return !error && !!data;
    }
    /**
     * 删除用户
     * @param {string} username - 用户名
     * @returns {Promise<boolean>}
     */
    async deleteUser(username) {
        if (!Supabase) {
            return false;
        }
        const { error } = await Supabase
            .from("users")
            .delete()
            .eq("username", username);
        return !error;
    }
    /**
     * 获取用户信息
     * @param {string} username - 用户名
     * @returns {Promise<object|null>}
     */
    async getUser(username) {
        if (!Supabase) {
            return null;
        }
        const { data, error } = await Supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();
        if (error || !data) {
            return null;
        }
        return data;
    }
}
// 导出单例实例
module.exports = new UserStore();
