FROM node:22-alpine

WORKDIR /workspace

COPY package.json ./
COPY package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY tsconfig.base.json ./
COPY angular.json ./
COPY apps/web apps/web

EXPOSE 4200
