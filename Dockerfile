FROM node:18

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /home/node/kzdl

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN pnpm types
RUN pnpm build

ENTRYPOINT [ "node", "dist/main.js" ]
