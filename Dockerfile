# build environment
FROM node:14-alpine as builder
RUN apk update
RUN apk add git
RUN apk add bash
RUN mkdir -p /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ["package.json", "package-lock.json*", "/app/"]
RUN npm install
COPY . /app
RUN echo '{"stamp":"'$(date)'"}' > stamp.json
RUN npm run generate
RUN npm run build

# production environment
FROM staticfloat/nginx-certbot
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/user.conf.d/nginx_template.conf
