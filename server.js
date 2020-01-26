const { createServer } = require('http')
const { parse } = require('url') // eslint-disable-line
const next = require('next')

const { PORT, HOSTNAME, NODE_ENV } = process.env
const app = next({ dev: !['production', 'test'].includes(NODE_ENV) })
const handle = app.getRequestHandler()

module.exports = app.prepare().then(() => {
  // Load synchronously In-memory Database to commonjs cache
  require('./imdb')

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (['/settings.json', '/products.json'].includes(pathname)) {
      app.render(req, res, '/error', query)
    } else {
      handle(req, res, parsedUrl)
    }
  })

  server.listen(PORT, err => {
    if (err) throw err
    if (NODE_ENV !== 'test') {
      console.log(`> Ready on ${HOSTNAME || 'http://localhost'}:${server.address().port}`)
    }
  })

  return server
})
