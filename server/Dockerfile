FROM node:11.5-alpine

RUN mkdir -p /usr/src/server

WORKDIR /usr/src/server

RUN apk add --no-cache \
	make \
	gcc \
	g++ \
	python \
	linux-headers \
	udev

# Prevent the reinstallation of node modules at every changes in the source code
COPY package.json ./
RUN yarn install

COPY . ./

CMD yarn start
