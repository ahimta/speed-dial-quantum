// @ts-check
let altKeyDown = false
let ctrlKeyDown = false
let digits = [0, 0]
let digitIndex = 0

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

  altKeyDown = event.code === 'AltLeft' || event.code === 'AltRight'
  ctrlKeyDown = event.code === 'ControlLeft' || event.code === 'ControlRight'
})

document.addEventListener('keypress', event => {
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

  altKeyDown = false
  ctrlKeyDown = false
  digits = [0, 0]
  digitIndex = 0
})
