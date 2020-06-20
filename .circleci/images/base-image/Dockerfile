FROM node:10.13.0-alpine

ARG CLOUD_SDK_VERSION=226.0.0
ENV CLOUD_SDK_VERSION=$CLOUD_SDK_VERSION
ENV DOCKERIZE_VERSION v0.6.1

ENV TERM=xterm-256color
ENV PATH /google-cloud-sdk/bin:$PATH

RUN apk update && apk upgrade && \
    apk --no-cache add \
        tar \
        gzip \
        ca-certificates \
        curl \
        python \
        py-crcmod \
        bash \
        libc6-compat \
        openssh-server \
        openssh-client \
        git \
        gnupg \
        docker \
        coreutils \
    && npm install -g yarn@1.12.x && rm -rf package-lock.json && \
    npm install -g rok8s-scripts && \
    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    tar xzf google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    rm google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    ln -s /lib /lib64 && \
    gcloud config set core/disable_usage_reporting true && \
    gcloud config set component_manager/disable_update_check true && \
    gcloud config set metrics/environment github_docker_image && \
    gcloud --version && \
    gcloud components install kubectl && \
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
        && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
        && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz
