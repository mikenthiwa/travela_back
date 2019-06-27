#!/bin/sh

printf "\n\n======================================\n"
printf "Making database migrations"
printf "\n======================================\n\n"
export NODE_ENV=development
yarn db:migrate
yarn db:seed
yarn db:user:migrate

printf "\n\n======================================\n"
printf "Start the application"
printf "\n======================================\n\n"
yarn start:dev

exit 0
