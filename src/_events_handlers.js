const platform = require('./platform')
const repos = require('./_repos')
const utils = require('./_utils')

module.exports = () => {
  let altKeyDown = false
  let ctrlKeyDown = false
  let digits = [0, 0]
  let digitIndex = 0
  let dialView = null

  function up () {
    if (!dialView) {
      dialView = document.createElement('section')
      const faviconImg = document.createElement('img')
      const leftDigit = document.createElement('span')
      const rightDigit = document.createElement('span')
      const rest = document.createElement('span')

      dialView.dir = 'ltr'
      dialView.style.fontSize = '1em'
      dialView.style.minHeight = '2em'
      dialView.style.backgroundColor = '#f5f5f5f5'
      dialView.style.color = 'red'
      dialView.style.width = '100%'
      dialView.style.top = '0px'
      dialView.style.textAlign = 'center'
      dialView.style.position = 'fixed'
      dialView.style.opacity = '100%'
      dialView.style.zIndex = '2147483647'

      faviconImg.src = ''
      faviconImg.width = 16
      faviconImg.height = 16
      faviconImg.style.marginRight = '1em'
      rest.innerText = '*_^'

      dialView.appendChild(faviconImg)
      dialView.appendChild(leftDigit)
      dialView.appendChild(rightDigit)
      dialView.appendChild(rest)

      document.body.appendChild(dialView)
    }
  }

  function down () {
    document.body.removeChild(dialView)
    dialView = null
    altKeyDown = false
    ctrlKeyDown = false
    digits = [0, 0]
    digitIndex = 0
  }

  return {
    keydown: async function (event) {
      if (
        !(
          event.code === 'AltLeft' ||
          event.code === 'AltRight' ||
          event.code === 'ControlLeft' ||
          event.code === 'ControlRight' ||
          (event.code && (altKeyDown || ctrlKeyDown))
        )
      ) {
        return
      }

      const isControl =
        event.code === 'AltLeft' ||
        event.code === 'AltRight' ||
        event.code === 'ControlLeft' ||
        event.code === 'ControlRight'

      if (!isControl) {
        if (!(event.code && (altKeyDown || ctrlKeyDown))) {
          down()
          return
        }

        const match =
          event.code.match(/^Digit([0-9])$/) ||
          event.code.match(/^Numpad([0-9])$/)

        if (!match) {
          down()
          return
        }

        event.preventDefault()

        const [, digitString] = match
        const digit = parseInt(digitString, 10)
        digits[digitIndex++ % 2] = digit

        const index =
          digitIndex % 2 !== 0 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

        const results = await repos.thumnail.list()
        const thumbnail = results[index] || { title: null, url: null }

        const [
          faviconImgView,
          leftDigitView,
          rightDigitView,
          restView
        ] = dialView.children

        faviconImgView.src = utils.getFaviconImgUrl(thumbnail.url)
        leftDigitView.innerText = `${digits[0]}`
        rightDigitView.innerText = digitIndex % 2 !== 0 ? '.' : `${digits[1]}`
        restView.innerText = ` - ${thumbnail.title || '(Empty -_-)'}`
        return
      }

      if (!(event.shiftKey || !(await repos.settings.shiftRequired()))) {
        return
      }

      up()

      altKeyDown = event.code === 'AltLeft' || event.code === 'AltRight'
      ctrlKeyDown =
        event.code === 'ControlLeft' || event.code === 'ControlRight'
    },
    mousedown: function (event) {
      if (dialView) {
        down()
      }
    },
    keyup: async function (event) {
      if (
        !(
          (altKeyDown &&
            (event.code === 'AltLeft' || event.code === 'AltRight')) ||
          (ctrlKeyDown &&
            (event.code === 'ControlLeft' || event.code === 'ControlRight'))
        )
      ) {
        return
      }

      const index =
        digitIndex % 2 !== 0 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

      if (index >= 0) {
        platform.sendMessage({
          digit: index + 1,
          altKey: altKeyDown,
          ctrlKey: ctrlKeyDown
        })
      }

      down()
    }
  }
}
