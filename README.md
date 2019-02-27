Express & ES6 REST API Boilerplate
==================================

This is a straightforward boilerplate for building REST APIs with ES6 and Express.

- ES6 support via [babel](https://babeljs.io)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)
- Mongoose
- Helmet
- Compression
- LogDNA & Bunyan
- Sentry
- Forest Admin
- Prettier & Eslint
- Debug for logging to console



Getting Started
---------------

```sh
# clone it
git clone git@github.com:gautiert/nodejs-express-starter.git project-name
cd project-name

# Make it your own
rm -rf .git && git init && npm init

# Install dependencies
yarn

# Set environment
cp .env.example .env

# Start development live-reload server
PORT=8080 yarn run dev

# Start production server:
PORT=8080 yarn start
```

License
-------

MIT
