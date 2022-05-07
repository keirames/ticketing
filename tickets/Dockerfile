FROM node:lts

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# extra step in order to use prisma library (might change in furture)
RUN npx prisma generate

RUN ["chmod", "+x", "./scripts/migrate.sh"]

CMD ./scripts/migrate.sh; npm run start:dev