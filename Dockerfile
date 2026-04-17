FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# FORCE BUILD OUTPUT CORRECTLY
RUN npm run build -- --configuration production --output-path=dist/qms-angular

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CLEAN DEFAULT FILES
RUN rm -rf /usr/share/nginx/html/*

# COPY BUILD OUTPUT
COPY --from=build /app/dist/qms-angular /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
