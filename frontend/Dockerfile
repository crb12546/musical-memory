FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install

COPY . .
RUN pnpm run build

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "8080"]
