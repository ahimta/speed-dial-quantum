// @ts-check
import * as repos from './_repos'

export default function () {
  let altKeyDown = false
  let ctrlKeyDown = false
  let digits = [0, 0]
  let digitIndex = 0
  let dialView = null

  function up () {
    if (!dialView) {
      dialView = document.createElement('section')
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
      dialView.innerText = '*_^'

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
          digitIndex === 1 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

        const results = await repos.thumnail.list()
        const thumbnail = results[index] || {}
        dialView.innerText = `${index + 1} - ${thumbnail.title ||
          '(Empty -_-)'}`
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
        digitIndex === 1 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

      console.log({ digits, index })
      if (index >= 0) {
        // @ts-ignore
        if (typeof browser !== 'undefined') {
          // @ts-ignore
          browser.runtime.sendMessage({
            digit: index + 1,
            altKey: altKeyDown,
            ctrlKey: ctrlKeyDown
          })
          // @ts-ignore
        } else if (typeof chrome !== 'undefined') {
          // @ts-ignore
          chrome.runtime.sendMessage({
            digit: index + 1,
            altKey: altKeyDown,
            ctrlKey: ctrlKeyDown
          })
        }
      }

      down()
    }
  }
}
