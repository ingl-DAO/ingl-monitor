FROM node:18.12.1-alpine3.16 as builder

# #set the working directory
WORKDIR /app
RUN rm -rf ./node_modules

# # install app dependencies
COPY package.json /app
COPY Package-lock.json /app

# #clean install dependecies
RUN npm install

# # add app
COPY . /app

#migrate prisma models
RUN npx prisma generate

# #build backend app
RUN npm run build

# # expose port 3011 to outer environment
EXPOSE 8080

# run app
WORKDIR /dist
CMD ["node", "main.js"]

# FROM caddy:2.6.2-alpine
# COPY --from=builder /app/dist/apps/skeleton-be /usr/share/caddy/html
