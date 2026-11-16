# syntax=docker/dockerfile:1
# Build multi-stage: compila con Node y sirve el estático con Nginx.
# El contexto de build es la raíz del repo porque el frontend importa /shared.

FROM node:20-alpine AS build
WORKDIR /app/frontend-vue

COPY frontend-vue/package.json frontend-vue/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY shared /app/shared
COPY frontend-vue /app/frontend-vue
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend-vue/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
