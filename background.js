// @ts-check

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

async function storedUrl (index) {
  // @ts-ignore
  const results = (await browser.storage.local.get()).thumbnails
  const thumbnail = results[index]
  return thumbnail && thumbnail.url
}
