FROM node:18.18.0 as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY nx.json .
COPY tsconfig.base.json .
COPY apps/ride-spark/tsconfig.app.json apps/ride-spark/
COPY libs/ libs/

RUN npm install

COPY . .

RUN npx nx run ride-spark:build --skip-nx-cache

FROM node:18.18.0

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ ./

EXPOSE 4444

CMD ["npx", "nx", "run", "ride-spark:serve:production"]
