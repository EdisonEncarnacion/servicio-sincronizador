FROM node:20.17.0-alpine3.20
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3089
CMD [ "npm", "run", "start:prod" ]
