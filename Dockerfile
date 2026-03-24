FROM node

WORKDIR /developer/nodejs/Flight-Booking-Service

COPY . .

RUN npm ci

CMD ["npm","run","dev"]