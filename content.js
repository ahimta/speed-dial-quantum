// @ts-check
let altKeyDown = false
let ctrlKeyDown = false
let digits = [0, 0]
let digitIndex = 0
let element = null

document.addEventListener('keydown', event => {
  if (
    !(
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.code === 'ControlLeft' ||
      event.code === 'ControlRight'
    )
  ) {
    return
  }

  element = document.createElement('section')
  element.style.fontSize = '1em'
  element.style.minHeight = '2em'
  element.style.backgroundColor = '#f5f5f5f5'
  element.style.color = 'red'
  element.style.width = `${window.innerWidth}px`
  element.style.top = `${window.scrollY + 1}px`
  element.style.textAlign = 'center'
  element.style.position = 'absolute'
  element.style.opacity = '100%'
  element.style.zIndex = '2147483647'
  element.innerText = '*_^'

  document.body.appendChild(element)

  altKeyDown = event.code === 'AltLeft' || event.code === 'AltRight'
  ctrlKeyDown = event.code === 'ControlLeft' || event.code === 'ControlRight'
})

document.addEventListener('keypress', async event => {
  if (!(event.code && (altKeyDown || ctrlKeyDown))) {
    return
  }

  const match =
    event.code.match(/^Digit([0-9])$/) || event.code.match(/^Numpad([0-9])$/)

  if (!match) {
    return
  }

  event.preventDefault()

  const [, digitString] = match
  const digit = parseInt(digitString, 10)
  digits[digitIndex++ % 2] = digit

  const index =
    digitIndex === 1 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

  // @ts-ignore
  const results = (await browser.storage.local.get()).thumbnails
  const thumbnail = results[index]
  element.innerText = `${index + 1} - ${thumbnail.title || '(Empty -_-)'}`
})

document.addEventListener('keyup', event => {
  if (
    !(
      (altKeyDown && (event.code === 'AltLeft' || event.code === 'AltRight')) ||
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
    browser.runtime.sendMessage({
      digit: index + 1,
      altKey: altKeyDown,
      ctrlKey: ctrlKeyDown
    })
  }

  document.body.removeChild(element)
  element = null
  altKeyDown = false
  ctrlKeyDown = false
  digits = [0, 0]
  digitIndex = 0
})
