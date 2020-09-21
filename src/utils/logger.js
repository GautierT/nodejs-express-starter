import Debug from 'debug'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import omit from 'lodash/omit'
import os from 'os'
import requestIp from 'request-ip'
import { sendError } from './errors'

import bunyan from 'bunyan'

import cleanDeep from 'clean-deep'

const env = process.env.NODE_ENV || process.argv.slice(2)[1] || 'development'
const LogDNAStream = require('logdna-bunyan').BunyanStream

const debug = Debug('app:logger')

const IS_LOGDNA_CONFIGURED = !!process.env.LOGDNA_APIKEY

let logDNA
if (IS_LOGDNA_CONFIGURED) {
  debug('Configuring LogDNA...')
  logDNA = new LogDNAStream({
    key: process.env.LOGDNA_APIKEY || '',
    app: process.env.NODE_ENV === 'production' ? 'Prod' : process.env.NODE_ENV === 'staging' ? 'Staging' : 'Dev',
    env: process.env.NODE_ENV,
    hostname: os.hostname(),
  })
} else {
  debug('LogDNA not configured.')
}

let logger

try {
  if (!logger) {
    logger = bunyan.createLogger({
      name: 'Logger',
      streams: [
        {
          stream: logDNA,
          type: 'raw',
        },
      ],
    })
    logger.on('error', function (err, stream) {
      // Handle stream write or create error here.
      console.log('Error when logging : ', err, ' / stream : ', stream)
      sendError(err)
    })
  }
} catch (err) {
  sendError(err)
}

export const customLogger = (meta, ...msg) => {
  try {
    const body = _cloneDeep(_get(meta, 'req.body', ''))
    if (body) {
      // noinspection JSUnresolvedVariable
      delete body.password
    }

    const ip = _get(meta, 'req') ? requestIp.getClientIp(_get(meta, 'req')) : undefined

    let auth_type
    if (_get(meta, 'req.method')) {
      if (_get(meta, 'req.api_key')) {
        auth_type = 'api_key'
      } else {
        auth_type = 'jwt'
      }
    }

    let data = {
      env: process.env.NODE_ENV,
      message_origin: _get(meta, 'req.method') ? 'request' : 'worker',
      others: {
        remote_addr: ip,
        api_key: _get(meta, 'req.api_key'),
        auth_type: auth_type,
      },
      body: body,
      http_request: {
        headers: _get(meta, 'req.headers'),
        method: _get(meta, 'req.method'),
        host: _get(meta, 'req.hostname'),
        path: _get(meta, 'req.path'),
        query_string: _get(meta, 'req.query'),
        request_id: _get(meta, 'req.id'),
        scheme: _get(meta, 'req.protocol'),
      },
      http_response: {
        time_ms: _get(meta, 'req.time_ms'),
        status: _get(meta, 'req.statusCode'),
      },
      error: {
        name: _get(meta, 'err.name'),
        message: _get(meta, 'err.message'),
        code: _get(meta, 'err.code'),
      },
      user: {
        remote_addr: ip,
        email: _get(meta, 'req.user.email', _get(meta, 'req.user.data.email', _get(meta, 'req.company.email'))),
        id: _get(meta, 'req.user.id', _get(meta, 'req.company.id')),
      },
    }
    data = omit(data, ['others.api_key.key', 'http_request.headers.authorization'])

    data = cleanDeep(data)

    // console.log('data : ', util.inspect(data, false, 4))

    if (env === 'production' && IS_LOGDNA_CONFIGURED) {
      // debug('logging')
      if (_get(meta, 'err') || (_get(meta, 'req.statusCode') && _get(meta, 'req.statusCode') >= 400)) {
        logger.error(data, ...msg)
      } else {
        logger.info(data, ...msg)
      }
    }
  } catch (ex) {
    debug('Error when sending log.  :  ', ex)
    sendError(ex)
  }
}

module.exports = {
  customLogger: customLogger,
}
