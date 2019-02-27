import Debug from 'debug'
import Promise from 'bluebird'

const debug = Debug('app:utils:index')
debug.log = console.log.bind(console)

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
