import { customLogger } from './utils/logger'
import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import Debug from 'debug'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'

const env = process.env.NODE_ENV || process.argv.slice(2)[1] || 'development'

const debug = Debug('app:server')
debug.log = console.log.bind(console)

mongoose.Promise = require('bluebird')
global.Promise = require('bluebird')

if (process.env.SENTRY_DSN) {
  debug('Configuring Sentry...')
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})

const app = express()

app.set('port', process.env.PORT || 8080)

app.use(Sentry.Handlers.requestHandler())

app.use(helmet())

// logger
app.use(morgan('dev'))

// 3rd party middleware

app.use(cors())
app.options('*', cors())

app.use(compression())

app.use(
  bodyParser.json({
    limit: '1mb',
  }),
)

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '1mb',
  }),
)

const options = {
  autoReconnect: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.connection.on('error', function(err) {
  debug('mongoose / On Error : ', err)
})
mongoose.connection.on('disconnected', function(err) {
  debug('mongoose / On Disconnect : ', err)
})

debug('Connecting to MongoDB...')

// noinspection JSIgnoredPromiseFromCall
mongoose.connect(process.env.MONGODB_URL, options, async err => {
  if (err) {
    console.error('Failed to connect to MongoDB on startup - retrying in 5 sec', err)
    throw new Error('Failed to connect to MongoDB.')
  }
  debug('Mongoose connected to MongoDB.')

  debug('Loading Routes...')
  require(path.join(__dirname, '/config/routes'))(app)
  debug('Routes loaded.')
  debug(`Starting at : http://localhost:${app.get('port')} in [${env}]...`)

  app.listen(app.get('port'), () => {
    customLogger({}, `Find at : http://localhost:${app.get('port')} in [${env}]`)
    debug(`Find at : http://localhost:${app.get('port')} in [${env}]`)
  })
})
