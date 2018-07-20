import eventsHandlers from './_events_handlers'
import * as repos from './_repos'
import render from './_ui'

window.Raven.config(
  'https://1e7c5d9a607b48de9ce21c3807df07f0@sentry.io/1246981'
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
