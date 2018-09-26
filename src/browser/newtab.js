const dialView = require('./_dial_view')
const repos = require('../repos')
const render = require('../ui')

// @ts-ignore
const { environment, version: release } = window && window.SDQ

window.Raven.config(
  'https://1e7c5d9a607b48de9ce21c3807df07f0@sentry.io/1246981',
  { environment, release }
).install()

window.Raven.context(() => {
  const view = dialView()

  document.addEventListener('keydown', view.keydown)
  document.addEventListener('mousedown', view.mousedown)
  document.addEventListener('keyup', view.keyup)
  ;(async () => {
    const groups = await repos.group.list()
    render(groups[0].id)
  })()
})
