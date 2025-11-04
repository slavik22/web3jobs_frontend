# build step
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# serve step
FROM nginx:alpine
# SPA fallback + static
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Cloud Run uses $PORT, so patch Nginx to listen on it
ENV PORT=8080
CMD sh -c "sed -i 's/%%PORT%%/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
