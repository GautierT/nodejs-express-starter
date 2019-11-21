import Debug from 'debug'
import Promise from 'bluebird'
import { customLogger } from './logger'

const debug = Debug('app:utils:index')
debug.log = console.log.bind(console)

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}


export const loggerMiddleware = (req, res, next) => {
  debug(`Started ${req.method} on ${req.path}`)
  customLogger({ req }, `Started ${req.method} on ${req.path}`)

  req.start_time = new Date().getTime()

  const end = res.end
  // const chunks = []
  res.end = function(chunk, encoding) {
    /* if (chunk) {
      chunks.push(chunk)
    } */
    // Emit the original res.end event
    res.end = end
    res.end(chunk, encoding)

    // destructure the response object for ease of use
    const status = res.statusCode

    // let body = Buffer.concat(chunks).toString('utf8')

    // calculate the duration of the http request
    const time_ms = new Date().getTime() - req.start_time

    // req.response_body = body
    req.time_ms = time_ms
    req.statusCode = status

    customLogger({ req }, `Ending ${req.method} on ${req.path} with status ${status} in ${time_ms}ms`)
    debug(`Ending ${req.method} on ${req.path} with status ${status} in ${time_ms}ms`)
  }

  next()
}
