FROM node:16

ENV PORT 3000

# setup direcrtory
RUN mkdir -p /usr/src/2bttns
WORKDIR /usr/src/2bttns

# install dependencies
COPY package.json /usr/src/2bttns/package.json
COPY package-lock.json /usr/src/2bttns/package-lock.json
RUN npm install

# copy source files
COPY . /usr/src/2bttns

# run the app
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

