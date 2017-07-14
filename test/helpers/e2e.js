'use strict'

const path = require('path')
const fse = require('fs-extra')

exports.updateSrc = function updateSrc (cb) {
  const original = path.resolve(__dirname, '../fixtures/e2e/src')
  const temp = path.resolve(__dirname, '../fixtures/e2e/.tmp')
  const updated = path.resolve(__dirname, '../fixtures/e2e/updated-src')

  function handleError (fn) {
    return err => {
      if (err) throw err
      fn()
    }
  }

  fse.copy(original, temp, handleError(() => {
    fse.copy(updated, original, handleError(() => {
      const revert = () => {
        fse.copySync(temp, original)
        fse.removeSync(temp)
      }

      cb(revert)
    }))
  }))
}

exports.removeDist = function removeDist (cb) {
  fse.remove(path.resolve(__dirname, '../fixtures/e2e/dist'), err => {
    if (err) throw err
    cb()
  })
}

exports.compare = function compare (type) {
  const actualDir = path.resolve(__dirname, '../fixtures/e2e/dist')
  const expectedDir = path.resolve(__dirname, '../expected', type)

  function loop (xs, ys) {
    if (xs.length === 0 && ys.length === 0) return
    if (xs.length > 0 && ys.length === 0 || xs.length === 0 && ys.length > 0) {
      console.log(xs, ys) // eslint-disable-line
      throw new Error('There are some inconsistencies between actual/expected files')
    }

    const xh = xs[0]
    const target = extract(xh, ys)

    if (target.index < 0) {
      throw new Error(`${xh} is not found in expected files`)
    }

    const statX = fse.statSync(actual(xh))
    const statY = fse.statSync(expected(xh))

    if (statX.isDirectory() && statY.isDirectory()) {
      loop(
        readdir(xh, actual),
        readdir(xh, expected)
      )
    } else if (statX.isFile() && statY.isFile()) {
      compareItem(xh)
    } else {
      throw new Error(`${xh} is output in incorrect format`)
    }
    loop(xs.slice(1), target.extracted)
  }

  function readdir (dir, map) {
    return fse.readdirSync(map(dir)).map(file => path.join(dir, file))
  }

  function actual (file) {
    return path.join(actualDir, file)
  }

  function expected (file) {
    return path.join(expectedDir, file)
  }

  function actualFile (file) {
    return fse.readFileSync(actual(file), 'utf8')
  }

  function expectedFile (file) {
    return fse.readFileSync(expected(file), 'utf8')
  }

  function compareItem (file) {
    expect(actualFile(file)).toBe(expectedFile(file))
  }

  return loop([''], [''])
}

function extract (x, ys) {
  function loop (x, pre, post) {
    if (post.length === 0) {
      return {
        index: -1,
        extracted: ys
      }
    }

    const head = post[0]
    const tail = post.slice(1)

    if (x === head) {
      return {
        index: pre.length,
        extracted: pre.concat(tail)
      }
    } else {
      return loop(x, pre.concat(head), tail)
    }
  }
  return loop(x, [], ys)
}
