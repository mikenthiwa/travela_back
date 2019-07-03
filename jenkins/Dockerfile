FROM node:10.13.0

RUN apt update && \
      apt install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common && \
      curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
      add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && \
      apt update && \
      apt install -y docker-ce && \
      echo "deb http://packages.cloud.google.com/apt cloud-sdk-jessie main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list && \
      curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
      apt-get update && sudo apt-get install -y kubectl google-cloud-sdk

RUN npm install -g yarn@1.12.x && rm -rf package-lock.json
