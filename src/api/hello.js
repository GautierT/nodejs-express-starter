import Debug from 'debug'

const debug = Debug('app:config:api:hello')

debug.log = console.log.bind(console)

export const setReq = async (req, res, next) => {
  debug('setReq')
  req.hello = 'Hello'

  next()
}

export const say = async (req, res) => {
  debug('say')
  res.json({
    message: 'Hello',
  })
}
