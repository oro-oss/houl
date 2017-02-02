#!/usr/bin/env node

require('yargs') // eslint-disable-line
  .version()
  .usage('Usage: $0 <command> [options]')
  .command('build', 'Build your project with config and tasks', require('../lib/cli/build'))
  .command('dev', 'Start development server') // TODO
  .demandCommand(1)
  .help('h')
  .alias('h', 'help')
  .argv
