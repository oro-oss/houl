const path = require('path')
const vfs = require('vinyl-fs')
const loadConfig = require('./config')
const processTask = require('./process-task')

exports.builder = {
  config: {
    alias: 'c',
    demand: true,
    describe: 'Path to a hole config file'
  }
}

exports.handler = argv => {
  const config = loadConfig(argv.config)

  // TODO: Execute pre tasks

  // Process all files in input directory
  const flow = Object.keys(config.rules).map(ext => {
    return {
      rule: config.rules[ext],
      task: config.tasks[config.rules[ext].task]
    }
  })

  vfs.src(path.join(config.input, '**/*'))
    .pipe(processTask(flow))
    .pipe(vfs.dest(config.output))
}
