FROM alpine:3.9

# File Author / Maintainer

# Update & install required packages
RUN apk add --update nodejs bash git yarn

# Install app dependencies
COPY package.json yarn.lock /www/
RUN cd /www; yarn install

# Copy app source
COPY . /www

# Set work directory to /www
WORKDIR /www

# set your port
ENV PORT 8080
ENV MONGODB_URL mongodb://localhost/nodejs-express-es6-starter
ENV DEBUG app:*
ENV DEBUG_DEPTH 5


# expose the port to outside world
EXPOSE  8080

# start command as per package.json
CMD ["yarn", "start"]
