import express from 'express'
import fs from 'fs'
import colors from 'colors'
import path from 'path'
import Debug from 'debug'

const env = process.env.NODE_ENV || process.argv.slice(2)[1] || 'development'

const debug = Debug('app:config:routes')
debug.log = console.log.bind(console)
const router = express.Router()

module.exports = function(app) {
  fs.readdirSync(path.join(__dirname, '/routes/')).forEach(function(routeFile) {
    require(path.resolve(__dirname, 'routes', routeFile))(app, router)
  })

  if (process.env.NODE_ENV === 'production') {
    app.use('/', router)
  } else {
    app.use('/api/', router)
  }

  if (process.env.FOREST_ENV_SECRET && process.env.FOREST_AUTH_SECRET) {
    debug('Starting Forest Admin...')
    if (process.env.NODE_ENV === 'production') {
      app.use(
        require('forest-express-mongoose').init({
          modelsDir: path.join(__dirname, '/../models'), // Your models directory.
          envSecret: process.env.FOREST_ENV_SECRET,
          authSecret: process.env.FOREST_AUTH_SECRET,
          mongoose: require('mongoose'), // The database connection.
        }),
      )
    } else {
      app.use(
        '/api/',
        require('forest-express-mongoose').init({
          modelsDir: path.join(__dirname, '/../models'), // Your models directory.
          envSecret: process.env.FOREST_ENV_SECRET,
          authSecret: process.env.FOREST_AUTH_SECRET,
          mongoose: require('mongoose'), // The database connection.
        }),
      )
    }
    debug('Forest admin started.')
  }

  app.use(function(err, req, res, next) {
    debug('Erreur Name : ', err.name)
    debug('Erreur Message : ', err.message)
    if (env === 'development') {
      debug(colors.red('Last Callback Erreur : ', err.stack))
    }

    if (err.message === 'File too large') {
      res.status(500).json({
        error: {
          message: 'Ce fichier est trop gros. (Max : 2Mo)',
          code: 500,
        },
      })
    } else if (err.message === 'File type not allowed') {
      res.status(500).json({
        error: {
          message: "Ce type de fichier n'est pas autorisé. (Uniquement pdf, jpg, jpeg ou png)",
          code: 500,
        },
      })
    } else if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: {
          message: "Vous n'êtes pas connecté ou votre connexion n'est pas valide.",
          code: 401,
        },
      })
    } else if (err.name === 'ValidationError') {
      return res.status(500).json({
        error: {
          message: 'Erreur lors de la sauvegarde.',
          code: 500,
        },
        err: err,
      })
    } else {
      return res.status(500).json({
        error: {
          message: "Erreur Inconnue. L'administrateur en a été informé.",
          code: 500,
        },
        err: err,
      })
    }
  })
}
