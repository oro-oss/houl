#!/usr/bin/env node

require('yargs') // eslint-disable-line
  .version()
  .usage('Usage: $0 <command> [options]')
  .command(
    'build',
    'Build your project with config and tasks',
    require('../lib/cli/build')
  )
  .command('dev', 'Start development server', require('../lib/cli/dev'))
  .command(
    'watch',
    'Watch the input directory and build updated files incrementally',
    require('../lib/cli/watch')
  )
  .demandCommand(1)
  .help('h')
  .alias('h', 'help').argv
