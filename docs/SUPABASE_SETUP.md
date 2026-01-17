# Supabase数据库集成指南

本文档说明如何配置和使用Supabase作为项目的数据库。

## 目录

- [概述](#概述)
- [Supabase设置](#supabase设置)
- [数据库配置](#数据库配置)
- [创建数据库表](#创建数据库表)
- [使用说明](#使用说明)
- [常见问题](#常见问题)

## 概述

项目已集成Supabase作为数据库，用于存储用户信息和API Key。Supabase提供了：

- PostgreSQL数据库
- 实时数据同步
- Row Level Security (RLS)
- 自动API生成
- 数据库管理界面

## Supabase设置

### 1. 创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com/)
2. 注册/登录账号
3. 创建新项目
4. 等待项目初始化完成

### 2. 获取项目配置信息

在Supabase项目设置中获取：

- **Project URL**: 项目URL（例如：`https://xxxxx.supabase.co`）
- **anon/public key**: 匿名公钥（用于客户端访问）

### 3. 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## 数据库配置

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase项目URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase匿名公钥 | `eyJhbGc...` |

## 创建数据库表

### 方式一：使用Supabase SQL Editor

1. 登录Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `migrations/001_create_users_table.sql` 文件中的SQL语句

### 方式二：使用Supabase CLI

```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化Supabase（如果还没有）
supabase init

# 链接到你的项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

### 数据库表结构

**users表：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键，自动生成 |
| `username` | VARCHAR(255) | 用户名，唯一 |
| `password` | VARCHAR(255) | 加密后的密码（SHA256） |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 |

## 使用说明

### 1. 初始化用户

配置好Supabase后，创建初始用户：

```bash
# 使用默认用户名和密码（admin/admin123）
pnpm init-user

# 或指定用户名和密码
pnpm init-user myuser mypassword
```

### 2. 获取API Key

```bash
curl -X POST http://localhost:5000/api/v1/auth/api-key \
     -H "Content-Type: application/json" \
     -d '{
  "username": "admin",
  "password": "admin123"
}'
```

### 3. 使用API Key

```bash
curl -X GET http://localhost:5000/api/v1/proxy/creatomate/renders \
     -H "Authorization: Bearer {your_access_key}"
```

## 数据库操作

### 查看用户

在Supabase Dashboard的Table Editor中可以查看和管理用户数据。

### 手动创建用户

```sql
INSERT INTO users (username, password)
VALUES ('username', 'sha256_hashed_password');
```

### 删除用户

```sql
DELETE FROM users WHERE username = 'username';
```

## 安全配置

### Row Level Security (RLS)

数据库表已启用RLS，当前策略允许服务角色完全访问。在生产环境中，建议：

1. 创建更严格的RLS策略
2. 使用服务角色密钥（`SUPABASE_SERVICE_ROLE_KEY`）进行后端操作
3. 限制匿名密钥的访问权限

### 密码加密

- 密码使用SHA256单向加密
- 明文密码不会存储在数据库中
- 建议使用强密码策略

## 常见问题

### 1. Supabase连接失败

**问题：** 无法连接到Supabase

**解决方案：**
- 检查 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
- 确认网络连接正常
- 检查Supabase项目是否正常运行

### 2. 表不存在错误

**问题：** `relation "users" does not exist`

**解决方案：**
- 执行 `migrations/001_create_users_table.sql` 创建表
- 确认表名和字段名正确

### 3. 权限错误

**问题：** `permission denied for table users`

**解决方案：**
- 检查RLS策略是否正确配置
- 确认使用的是正确的密钥（anon key或service role key）
- 检查数据库用户权限

### 4. 用户创建失败

**问题：** 无法创建用户

**解决方案：**
- 检查用户名是否已存在
- 确认数据库连接正常
- 查看服务器日志了解详细错误

## 迁移说明

### 从内存存储迁移到Supabase

1. 配置Supabase环境变量
2. 执行数据库迁移脚本
3. 迁移现有用户数据（如果有）
4. 重启服务器

### 数据迁移脚本示例

```sql
-- 如果有内存中的用户数据，可以手动插入
INSERT INTO users (username, password)
VALUES 
  ('admin', 'sha256_hash_of_password'),
  ('user1', 'sha256_hash_of_password');
```

## 相关文件

- Supabase配置：`src/config/supabase-config.js`
- 用户存储：`src/utils/user-store.js`
- 鉴权服务：`src/services/auth-service.js`
- 数据库迁移：`migrations/001_create_users_table.sql`
- 初始化脚本：`src/scripts/init-user.js`

## 更新日志

- 2024-01-17：集成Supabase数据库，实现基于数据库的用户鉴权
