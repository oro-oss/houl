'use strict'

const util = require('../../lib/util')

describe('Util', () => {
  describe('dropWhile', () => {
    const isZero = item => item === 0

    it('works', () => {
      expect(util.dropWhile([0, 0, 1, 2, 0, 3], isZero)).toEqual([1, 2, 0, 3])
    })

    it('keeps original if not matched', () => {
      const list = [1, 2, 3, 4]
      expect(util.dropWhile(list, isZero)).toEqual(list)
    })

    it('drops all if matched all', () => {
      expect(util.dropWhile([0, 0, 0], isZero)).toEqual([])
    })
  })
})
