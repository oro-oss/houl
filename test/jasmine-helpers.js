const _normalize = require('normalize-path')
function normalize (value) {
  return _normalize(value.replace(/^\w:\\/, '\\'))
}

beforeEach(() => {
  jasmine.addMatchers({
    toBePath (util, customEqualityTesters) {
      return {
        compare (actual, expected) {
          actual = normalize(actual)
          expected = normalize(expected)

          const result = {}
          result.pass = util.equals(actual, expected, customEqualityTesters)

          if (!result.pass) {
            result.message = 'Expected ' + expected + ' but found ' + actual
          }

          return result
        }
      }
    }
  })
})
