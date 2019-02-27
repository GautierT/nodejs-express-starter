import mongoose from 'mongoose'
import shortid from 'shortid'

/**
 * Users schema
 * @constructor Hello
 */
import Debug from 'debug'

const debug = Debug('app:models:hello')
debug.log = console.log.bind(console)

let Hello = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },

  name: String,
})

Hello.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' })

Hello = mongoose.model('Hello', Hello)
export default Hello
