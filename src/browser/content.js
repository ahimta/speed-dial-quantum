const dialView = require('./_dial_view')

const view = dialView()
document.addEventListener('keydown', view.keydown)
document.addEventListener('mousedown', view.mousedown)
document.addEventListener('keyup', view.keyup)
