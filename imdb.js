const { strict: { deepEqual } } = require('assert')
const {
  readFileSync,
  promises: { writeFile, readFile, rename }
} = require('fs')

function load (path) {
  const json = readFileSync(path)
  if (!json.toString()) return false
  const object = JSON.parse(json)
  return object
}

const test = process.env.NODE_ENV === 'test'
const path = name => `./public/${name}${test ? '.test':''}.json`

class IMDB {
  constructor () {
    this.settings = load(path('settings')) || {}
    this.products = load(path('products')) || []
  }
  async backup (name) {
    // Create backup-file
    const json = JSON.stringify(this[name])
    await writeFile('.backup', json)

    // Test if written backup-file is deeply equal to memory object
    const backupJson = await readFile('.backup')
    const backupObject = JSON.parse(backupJson)
    deepEqual(backupObject, this[name])

    // Apply backup
    await rename('.backup', path(name))
  }
}

module.exports = new IMDB
