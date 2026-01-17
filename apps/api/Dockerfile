FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 安装 pnpm（如果使用 pnpm）
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["node", "apps/api/src/index.js"]
