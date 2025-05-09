FROM node:20-alpine as build-stage

WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm

COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:stable-alpine as production-stage

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]