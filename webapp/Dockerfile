# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# 2) build
FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=true
# Pass build-time vars if you use them - CRA only picks up REACT_APP_*
# ARG REACT_APP_API_BASE=
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) production deps only
# CRA outputs static files, but we keep this stage to mirror your structure.
# We only need a tiny static server at runtime.
FROM node:20-alpine AS prod-deps
WORKDIR /app
# Install only what's needed to run the static server
RUN npm i -g serve@14

# 4) runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
RUN addgroup -g 1001 -S nodejs && adduser -S reactapp -u 1001

# copy built app and the static server
COPY --from=builder   /app/build       ./build
COPY --from=prod-deps /usr/local       /usr/local

# ensure non-root ownership
RUN chown -R reactapp:nodejs /app
USER reactapp

EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3000"]
