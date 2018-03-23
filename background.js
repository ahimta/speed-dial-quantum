// @ts-check
const storage = {
  get: async key => {
    // @ts-ignore
    if (typeof browser !== 'undefined') {
      // @ts-ignore
      return (await browser.storage.local.get())[key]
      // @ts-ignore
    } else if (typeof chrome !== 'undefined') {
      return (async () =>
        new Promise(resolve => {
          // @ts-ignore
          chrome.storage.local.get([key], result => {
            // @ts-ignore
            console.log({ err: chrome.runtime.lastError })
            resolve(result[key])
          })
        }))()
    }
  }
}

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
