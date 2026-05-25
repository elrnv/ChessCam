FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_LICHESS_CLIENT_ID
ARG VITE_LICHESS_HOST
ENV VITE_LICHESS_CLIENT_ID=$VITE_LICHESS_CLIENT_ID
ENV VITE_LICHESS_HOST=$VITE_LICHESS_HOST

RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz | grep -q ok || exit 1
