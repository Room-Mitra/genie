# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# 2) build (optional)
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || echo "No build step defined"

# 3) production deps only
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# 4) runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S express -u 1001

# prod node_modules + app files
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app ./

# permissions
RUN chown -R express:nodejs /app

USER express
EXPOSE 4000
ENV PORT=4000
CMD ["npm", "start"]
