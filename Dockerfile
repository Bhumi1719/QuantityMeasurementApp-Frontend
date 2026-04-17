# ─── Stage 1: Build Angular ───────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (cache node_modules layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy rest of source
COPY . .

# Build for production
RUN npm run build -- --configuration production

# ─── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config (handles Angular routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=build /app/dist/qms-angular /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
