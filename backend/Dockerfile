FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install

FROM deps AS build
COPY backend backend
RUN npm --workspace backend run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install --omit=dev --workspace backend
COPY --from=build /app/backend/dist backend/dist
EXPOSE 3000
CMD ["npm", "--workspace", "backend", "run", "start"]
