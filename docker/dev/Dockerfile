FROM node:10.13.0

LABEL MAINTAINER="Harith Javed <harith.bakhrani@andela.com>"
LABEL application="travela-backend"

ENV TERM=xterm-256color

WORKDIR /usr/app

RUN apt-get -y update && apt-get -y upgrade && \
  apt-get install -y software-properties-common && \
  apt-get install -y python3 python3-pip python3-dev && \
  apt-get install -y tesseract-ocr

RUN npm install -g yarn@1.12.x && rm -rf package-lock.json

RUN pip3 install --upgrade pip setuptools passporteye
COPY package.json /usr/app
COPY yarn.lock /usr/app

RUN yarn install
