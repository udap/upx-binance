FROM keymetrics/pm2:10-jessie
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

ENV NODE_ENV production
RUN yarn install --production=true
COPY . ./
RUN yarn build
CMD ["pm2-runtime", "start", "npm", "--name", "upx-relay", "--env", "production", "--", "run", "prod-run"]
