'use strict'

const prod = require('../../../lib/api').prod
const helpers = require('../../helpers')
const source = helpers.source
const transform = helpers.transform

const trans = transform((text, encoding, done) => {
  done(null, 'transformed')
})

source(['source'])
  .pipe(prod(trans))
  .on('data', data => console.log(data)) // eslint-disable-line
