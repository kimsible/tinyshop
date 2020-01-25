const { strict: { deepEqual } } = require('assert')
const {
  readFileSync,
  promises: { writeFile, readFile, rename }
} = require('fs')

function load (path) {
  const json = readFileSync(path)
  const object = JSON.parse(json)
  return object
}

class IMDB {
  constructor () {
    this.settings = load('./public/settings.json')
    this.products = load('./public/products.json')
  }
  async backup (name) {
    const json = JSON.stringify(this[name])
    const path = `./public/${name}.json`

    // Create backup-file
    const backupPath = `./public/${name}.backup.json`
    await writeFile(backupPath, json)

    // Test if written backup-file is deeply equal to memory object
    const backupJson = await readFile(backupPath)
    const backupObject = JSON.parse(backupJson)
    deepEqual(backupObject, this[name])

    // Apply backup
    await rename(backupPath, path)
  }
}

module.exports = new IMDB
