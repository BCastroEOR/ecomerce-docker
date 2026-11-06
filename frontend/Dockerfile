# syntax=docker/dockerfile:1.7
# =============================================================================
# Frontend Next.js 16 — build multi-stage
#   deps    -> instala dependencias (capa cacheada mientras no cambie el lockfile)
#   builder -> compila la app con `next build` (output: standalone)
#   runner  -> imagen final mínima: solo el servidor standalone + assets estáticos
# =============================================================================

ARG NODE_VERSION=20-alpine

# -----------------------------------------------------------------------------
# Etapa 1: dependencias
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# libc6-compat: algunos binarios nativos (p. ej. @next/swc, lightningcss) lo requieren en Alpine.
RUN apk add --no-cache libc6-compat

# Solo los manifiestos: si el código cambia pero el lockfile no, esta capa se reutiliza.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# -----------------------------------------------------------------------------
# Etapa 2: build de producción
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Las variables NEXT_PUBLIC_* se incrustan en el bundle del navegador durante el build.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# -----------------------------------------------------------------------------
# Etapa 3: runtime
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Usuario sin privilegios: si el proceso se ve comprometido no tiene acceso root al contenedor.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Solo lo necesario para ejecutar el servidor de producción:
#  - .next/standalone: server.js + node_modules mínimos trazados por Next
#  - .next/static y public: assets que el servidor standalone sirve directamente
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/products >/dev/null || exit 1

# server.js es el servidor de producción que genera `next build` en modo standalone (equivalente a `next start`).
CMD ["node", "server.js"]
