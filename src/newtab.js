import eventsHandlers from './_events_handlers'
import * as repos from './_repos'
import render from './_ui'

const handlers = eventsHandlers()
document.addEventListener('keydown', handlers.keydown)
document.addEventListener('mousedown', handlers.mousedown)
document.addEventListener('keyup', handlers.keyup)
;(async () => {
  const groups = await repos.group.list()
  render(groups[0].id)
})()
