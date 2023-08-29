# Based on https://create.t3.gg/en/deployment/docker#3-create-dockerfile

ARG DATABASE_URL
ARG NEXTAUTH_URL="http://localhost:3262"
ARG NEXTAUTH_SECRET="placeholder-secret-remember-to-change"
ARG GITHUB_ID
ARG GITHUB_SECRET
ARG SERVER_LOG_LEVEL="info"
ARG SERVER_LOG_LOCALE="en-US"

##### DEPENDENCIES

FROM --platform=linux/amd64 node:16-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM --platform=linux/amd64 node:16-alpine3.17 AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
    elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### RUNNER

FROM --platform=linux/amd64 node:16-alpine3.17 AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/utils ./src/utils

RUN npm i -g @2bttns/2bttns-cli
RUN chown -R nextjs:nodejs /usr/local/lib/node_modules/@2bttns

USER nextjs

ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GITHUB_ID
ARG GITHUB_SECRET
ARG SERVER_LOG_LEVEL
ARG SERVER_LOG_LOCALE

ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV GITHUB_ID=$GITHUB_ID
ENV GITHUB_SECRET=$GITHUB_SECRET
ENV SERVER_LOG_LEVEL=$SERVER_LOG_LEVEL
ENV SERVER_LOG_LOCALE=$SERVER_LOG_LOCALE

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

ENV PORT 3262
EXPOSE 3262

# The output: "standalone" config in next.config.mjs allows us to run the app with node directly instead of using next start
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]