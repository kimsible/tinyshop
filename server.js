const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const { PORT, URL } = process.env
const app = next({dev: false})
const handle = app.getRequestHandler()

module.exports = app.prepare().then(() => {
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
    console.log(`> Ready on ${URL || 'http://localhost'}:${server.address().port}`)
  })

  return server
})
