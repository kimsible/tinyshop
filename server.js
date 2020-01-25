const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const { PORT, URL, NODE_ENV } = process.env
const app = next({ dev: !['production', 'test'].includes(NODE_ENV) })
const handle = app.getRequestHandler()

module.exports = app.prepare().then(() => {
  // Load synchronously In-memory Database to commonjs cache
  require('./imdb')

  const server = createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
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
      console.log(`> Ready on ${URL || 'http://localhost'}:${server.address().port}`)
    }
  })

  return server
})
