'use strict'

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const Config = require('./models/config')
const util = require('./util')

function loadConfig(configPath, configOptions, transform = util.identity) {
  const options = {}
  const base = (options.base = path.dirname(configPath))

  const configOrFn = loadConfigFile(configPath)

  // Get a config object based on configOptions if it is a function
  const rawConfig =
    typeof configOrFn === 'function'
      ? configOrFn(configOptions || {})
      : configOrFn

  // If it is a preset object, may be transformed via `preset.modifyConfig`
  const config = transform(rawConfig) || rawConfig

  // Unify the `preset` option into the object style
  const preset =
    typeof config.preset === 'string' ? { name: config.preset } : config.preset

  if (preset && preset.name) {
    const presetPath = resolvePresetPath(preset.name, base)
    options.preset = loadConfig(presetPath, preset.options, preset.modifyConfig)
  }

  const tasks = config.taskFile
    ? require(path.resolve(base, config.taskFile))
    : {}

  return Config.create(config, tasks, options)
}
exports.loadConfig = loadConfig

function loadConfigFile(configPath) {
  const ext = path.extname(configPath)

  assert(
    ext === '.js' || ext === '.json',
    path.basename(configPath) + ' is non-supported file format.'
  )

  try {
    return require(path.resolve(configPath))
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`${configPath} is not found.`)
    } else {
      throw e
    }
  }
}

function resolvePresetPath(preset, base) {
  if (!util.isLocalPath(preset)) {
    return require.resolve(preset)
  }
  return require.resolve(path.resolve(base, preset))
}

function findConfig(dirname, exists) {
  exists = exists || fs.existsSync

  const jsConfig = path.join(dirname, 'houl.config.js')
  if (exists(jsConfig)) {
    return jsConfig
  }

  const jsonConfig = path.join(dirname, 'houl.config.json')
  if (exists(jsonConfig)) {
    return jsonConfig
  }

  const parent = path.dirname(dirname)
  if (parent === dirname) {
    return null
  }

  return findConfig(parent, exists)
}
exports.findConfig = findConfig
