'use strict'

const dev = require('../../../lib/api').dev
const helpers = require('../../helpers')
const source = helpers.source
const transform = helpers.transform

const trans = transform((text, encoding, done) => {
  done(null, 'transformed')
})

source(['source'])
  .pipe(dev(trans))
  .on('data', data => console.log(data)) // eslint-disable-line
