import * as platform from './_platform'
import * as repos from './_repos'

export default function () {
  let altKeyDown = false
  let ctrlKeyDown = false
  let shiftKeyDown = false

  let digits = [0, 0]
  let digitIndex = 0
  let dialView = null

  function up () {
    // @todo: convert to guard condition:smiley:
    if (!dialView) {
      dialView = document.createElement('section')
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

      if (altKeyDown) {
        rest.innerText = 'Please use "Shift" instead of "Alt" :)'
      } else {
        const leftDigit = document.createElement('span')
        const rightDigit = document.createElement('span')

        rest.innerText = '*_^'

        dialView.appendChild(leftDigit)
        dialView.appendChild(rightDigit)
      }

      dialView.appendChild(rest)
      document.body.appendChild(dialView)
    }
  }

  function down () {
    if (!dialView) {
      return
    }

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
          event.code === 'ShiftLeft' ||
          event.code === 'ShiftRight' ||
          (event.code && (altKeyDown || ctrlKeyDown || shiftKeyDown))
        )
      ) {
        return
      }

      const isControl =
        event.code === 'AltLeft' ||
        event.code === 'AltRight' ||
        event.code === 'ControlLeft' ||
        event.code === 'ControlRight' ||
        event.code === 'ShiftLeft' ||
        event.code === 'ShiftRight'

      if (!isControl) {
        if (!(event.code && (altKeyDown || ctrlKeyDown || shiftKeyDown))) {
          down()
          return
        }

        if (altKeyDown) {
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
        const thumbnail = results[index] || {}

        const [leftDigitView, rightDigitView, restView] = dialView.children

        leftDigitView.innerText = `${digits[0]}`
        rightDigitView.innerText = digitIndex % 2 !== 0 ? '.' : `${digits[1]}`
        restView.innerText = ` - ${thumbnail.title || '(Empty -_-)'}`
        return
      }

      altKeyDown = event.code === 'AltLeft' || event.code === 'AltRight'
      ctrlKeyDown =
        event.code === 'ControlLeft' || event.code === 'ControlRight'
      shiftKeyDown = event.code === 'ShiftLeft' || event.code === 'ShiftRight'

      up()
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
            (event.code === 'ControlLeft' || event.code === 'ControlRight')) ||
          (shiftKeyDown &&
            (event.code === 'ShiftLeft' || event.code === 'ShiftRight'))
        )
      ) {
        return
      }

      if (altKeyDown) {
        down()
        return
      }

      const index =
        digitIndex % 2 !== 0 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

      if (index >= 0) {
        platform.sendMessage({
          digit: index + 1,
          altKey: shiftKeyDown,
          ctrlKey: ctrlKeyDown
        })
      }

      down()
    }
  }
}
