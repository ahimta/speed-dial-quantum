// @ts-check

// @ts-ignore
browser.runtime.onMessage.addListener(async request => {
  const index = parseInt(request.digit, 10) - 1
  if (index < 0 || index >= 8) {
    return
  }

  const url = await storedUrl(index)
  window.alert(url)
  if (!url) {
    return
  }

  // @ts-ignore
  browser.tabs.create({ url })
})

async function storedUrl (index) {
  // @ts-ignore
  const results = (await browser.storage.local.get()).thumbnails
  const thumbnail = results[index]
  return thumbnail && thumbnail.url
}
