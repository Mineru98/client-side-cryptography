# Multi-stage build

# Stage 1: WebAssembly 빌드
FROM golang:1.19-alpine AS wasm-builder
WORKDIR /workspace
COPY crypto-wasm/ ./
RUN apk add --no-cache bash
RUN chmod +x build.sh && ./build.sh

# Stage 2: Frontend 빌드
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ ./src/
COPY crypto-wasm/ ./crypto-wasm/
COPY --from=wasm-builder /workspace/main.wasm ./src/
COPY --from=wasm-builder /workspace/wasm_exec.js ./src/
RUN npm run build

# Stage 3: Production
FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"] 