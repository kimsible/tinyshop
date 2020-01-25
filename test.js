import test from 'ava'
import http from 'http'
import { promises as fs } from 'fs'

let server
let settingsExists
let productsExists

const request = path => new Promise((resolve, reject) => {
  http
    .get(`http://localhost:${server.address().port}${path}`, res => resolve(res))
    .on('error', reject)
})

test.before(async t => {
  server = await require('./server')
  try {
    await fs.access('./public/settings.json')
    settingsExists = true
  } catch {
    await fs.writeFile('./public/settings.json', '{}')
  }
  try {
    await fs.access('./public/products.json')
    productsExists = true
  } catch {
    await fs.writeFile('./public/products.json', '[]')
  }
  require('./imdb')
})

test('server - run', async t => {
  t.is(typeof server.address().port, 'number')
})

test('server - 200 /', async t => {
  const { statusCode } = await request('/')
  t.is(statusCode, 200)
})

test('server - 404 /public/settings.json', async t => {
  const { statusCode } = await request('/public/settings.json')
  t.is(statusCode, 404)
})

test('server - 404 /public/products.json', async t => {
  const { statusCode } = await request('/public/products.json')
  t.is(statusCode, 404)
})

test('imdb - loaded', async t => {
  const imdb = require.cache[require.resolve('./imdb')].exports
  t.is(typeof imdb.settings, 'object')
  t.is(typeof imdb.products, 'object')
})

test('imdb - backup', async t => {
  const imdb = require('./imdb')
  imdb.settings = { ...imdb.settings, name: 'tinyshop' }
  await imdb.backup('settings')
  t.throwsAsync(async () => await fs.access('./public/settings.backup.json'), Error)
  t.deepEqual(imdb.settings, JSON.parse(await fs.readFile('./public/settings.json')))
})

test.after.always(async () => {
  if (!settingsExists) {
    await fs.unlink('./public/settings.json')
  }
  if (!productsExists) {
    await fs.unlink('./public/products.json')
  }
  try { await fs.unlink('./public/settings.backup.json') } catch {}
  try { await fs.unlink('./public/products.backup.json') } catch {}
})
