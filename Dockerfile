FROM mhart/alpine-node:8
RUN apk add --update bash
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY wait.sh /usr/src/app/
RUN npm install
COPY . /usr/src/app
EXPOSE 3000
CMD [ "/bin/bash", "./wait.sh", "mongo:27017", "--", "node", "index.js" ]
