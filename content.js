// @ts-check
document.addEventListener('keypress', event => {
  if (!event.ctrlKey || !event.code) {
    return
  }

  const match = event.code.match(/^Digit([0-9])$/)

  if (!match) {
    return
  }

  event.preventDefault()

  const [, digitString] = match
  const digit = parseInt(digitString, 10)

  // @ts-ignore
  browser.runtime.sendMessage({ digit })
})
