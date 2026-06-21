FROM node:22-alpine

WORKDIR /workspace

RUN apk add --no-cache openssl python3 make g++

COPY package.json ./
COPY package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY tsconfig.base.json ./
COPY apps/api apps/api

EXPOSE 3000
