const { strict: { deepEqual } } = require('assert')
const {
  readFileSync,
  promises: { writeFile, readFile, rename }
} = require('fs')

function load (path) {
  const buffer = readFileSync(path)
  if (!buffer.toString()) return false
  const object = JSON.parse(buffer)
  return object
}

const test = process.env.NODE_ENV === 'test'
const path = name => `./public/${name}${test ? '.test' : ''}.json`

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
    const buffer = await readFile('.backup')
    const object = JSON.parse(buffer)
    deepEqual(object, this[name])

    // Apply backup
    await rename('.backup', path(name))
  }
}

module.exports = new IMDB()
