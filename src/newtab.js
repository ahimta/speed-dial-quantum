const eventsHandlers = require('./_events_handlers')
const repos = require('./_repos')
const render = require('./_ui')

// @ts-ignore
const { environment, version: release } = window && window.SDQ

window.Raven.config(
  'https://1e7c5d9a607b48de9ce21c3807df07f0@sentry.io/1246981',
  { environment, release }
).install()

window.Raven.context(() => {
  const handlers = eventsHandlers()
  document.addEventListener('keydown', handlers.keydown)
  document.addEventListener('mousedown', handlers.mousedown)
  document.addEventListener('keyup', handlers.keyup)
  ;(async () => {
    const groups = await repos.group.list()
    render(groups[0].id)
  })()
})
