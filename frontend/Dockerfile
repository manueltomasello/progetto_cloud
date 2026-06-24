# ── Stage 1: Build dell'app Vue ──────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/ .
COPY backend/public/img/ ./img/ 

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

# ── Stage 2: Serve con nginx ──────────────────────
FROM nginx:alpine

# Copia la build di Vue dentro nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configurazione nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
