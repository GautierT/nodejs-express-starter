import colors from 'colors'
import * as Sentry from '@sentry/node'

import Debug from 'debug'
import { customLogger } from './logger'

const debug = Debug('app:utils:errors')

const env = process.env.NODE_ENV || process.argv.slice(2)[1] || 'development'

process.on('unhandledRejection', function(reason) {
  debug('logging unhandledRejection :', reason)
  sendError(reason)
})
process.on('uncaughtException', function(ex) {
  debug('logging uncaughtException :', ex)
  sendError(ex)
})

export const sendError = err => {
  if (env === 'production' || env === 'staging') {
    debug(colors.red('Sending error : '))
    debug(err)
    customLogger({ err }, `Sending error to sentry : ${err}`)
    const eventId = Sentry.captureException(err)
    debug(`Event ${eventId} sent to sentry`)
  } else {
    debug('Not in production. Dont sent to Sentry.')
    debug('err : ', err)
  }
}
