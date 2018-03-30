// @ts-check
export async function get (key) {
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

export async function set (key, value) {
  // @ts-ignore
  if (typeof browser !== 'undefined') {
    // @ts-ignore
    return browser.storage.local.set({ [key]: value })
    // @ts-ignore
  } else if (typeof chrome !== 'undefined') {
    return (async () =>
      new Promise(resolve => {
        // @ts-ignore
        chrome.storage.local.set({ [key]: value }, () => {
          // @ts-ignore
          console.log({ err: chrome.runtime.lastError })
          resolve()
        })
      }))()
  }
}
