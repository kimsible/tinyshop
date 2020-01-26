import test from 'ava'
import http from 'http'
import { promises as fs } from 'fs'

let server

const request = path => new Promise((resolve, reject) => {
  http
    .get(`http://localhost:${server.address().port}${path}`, res => resolve(res))
    .on('error', reject)
})

test.before(async () => {
  await fs.writeFile('./public/settings.test.json', '')
  await fs.writeFile('./public/products.test.json', '')
  server = await require('./server')
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
  t.is(imdb.settings.constructor.name, 'Object')
  t.is(imdb.products.constructor.name, 'Array')
})

test('imdb - backup', async t => {
  const imdb = require('./imdb')
  imdb.settings = { ...imdb.settings, name: 'tinyshop' }
  await imdb.backup('settings')
  t.throwsAsync(() => fs.access('.backup'), Error)
  t.deepEqual(imdb.settings, JSON.parse(await fs.readFile('./public/settings.test.json')))
})

test.after.always(async () => {
  try { await fs.unlink('./public/settings.test.json') } catch {}
  try { await fs.unlink('./public/products.test.json') } catch {}
  try { await fs.unlink('.backup') } catch {}
})
