// @ts-check
import * as storage from './_storage'

// @ts-ignore
if (typeof browser !== 'undefined') {
  // @ts-ignore
  browser.runtime.onMessage.addListener(async request => {
    const index = parseInt(request.digit, 10) - 1

    const url = await storedUrl(index)
    if (!url) {
      return
    }

    if (request.altKey) {
      // @ts-ignore
      browser.tabs.create({ url })
    } else if (request.ctrlKey) {
      // @ts-ignore
      browser.tabs.update({ url })
    }
  })
  // @ts-ignore
} else if (typeof chrome !== 'undefined') {
  // @ts-ignore
  chrome.runtime.onMessage.addListener(async request => {
    const index = parseInt(request.digit, 10) - 1

    const url = await storedUrl(index)
    if (!url) {
      return
    }

    if (request.altKey) {
      // @ts-ignore
      chrome.tabs.create({ url })
    } else if (request.ctrlKey) {
      // @ts-ignore
      chrome.tabs.update({ url })
    }
  })
}

async function storedUrl (index) {
  const results = await storage.get('thumbnails')
  const thumbnail = results[index]
  return thumbnail && thumbnail.url
}
