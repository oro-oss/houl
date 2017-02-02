const path = require('path')
const vfs = require('vinyl-fs')
const loadConfig = require('./config')
const processTask = require('./process-task')

exports.builder = {
  config: {
    alias: 'c',
    demand: true,
    describe: 'Path to a houl config file'
  }
}

exports.handler = argv => {
  const config = loadConfig(argv.config)

  // TODO: Execute pre tasks

  // Process all files in input directory
  vfs.src(path.join(config.input, '**/*'))
    .pipe(processTask(config))
    .pipe(vfs.dest(config.output))
}
