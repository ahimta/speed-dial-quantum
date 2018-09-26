// at the moment, only Firefox and Chromium are supported :)
const platformName = typeof browser !== 'undefined' ? 'firefox' : 'chromium'

module.exports =
  platformName === 'firefox' ? require('./_firefox') : require('./_chromium')
