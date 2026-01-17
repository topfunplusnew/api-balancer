const { AuthService } = require("../services");
const { Logger } = require("../config");

/**
 * 初始化用户脚本
 * 用于创建初始用户
 */
async function initUser() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";

  try {
    const user = await AuthService.createUser(username, password);
    Logger.info(`用户创建成功: ${user.username}`);
    console.log(`✓ 用户创建成功`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  密码: ${password}`);
    console.log(`\n提示: 使用以下命令获取API Key:`);
    console.log(`  curl -X POST http://localhost:5000/api/v1/auth/api-key \\`);
    console.log(`       -H "Content-Type: application/json" \\`);
    console.log(`       -d '{"username":"${username}","password":"${password}"}'`);
  } catch (error) {
    if (error.statusCode === 409) {
      Logger.warn(`用户已存在: ${username}`);
      console.log(`⚠ 用户已存在: ${username}`);
    } else {
      Logger.error(`用户创建失败: ${error.message}`);
      console.error(`✗ 用户创建失败: ${error.message}`);
      if (error.message?.includes("Supabase")) {
        console.error(`\n请检查:`);
        console.error(`  1. 环境变量 SUPABASE_URL 和 SUPABASE_ANON_KEY 是否已设置`);
        console.error(`  2. Supabase数据库表是否已创建（运行 apps/api/migrations/001_create_users_table.sql）`);
      }
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initUser().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { initUser };
