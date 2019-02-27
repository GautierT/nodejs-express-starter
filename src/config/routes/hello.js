import Debug from 'debug'
import * as HellosApi from '../../api/hello'

const debug = Debug('app:config:routes:hello')
debug.log = console.log.bind(console)

module.exports = function(app, router) {
  router.param('id', HellosApi.setReq)

  router
    .route('/hello')
    .all((req, res, next) => {
      next()
    })

    .get(HellosApi.say)
}
