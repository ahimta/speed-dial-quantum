// @ts-check
export async function get (key) {
  // @ts-ignore
  if (typeof browser !== 'undefined') {
    // @ts-ignore
    return (await browser.storage.local.get())[key]
    // @ts-ignore
  } else if (typeof chrome !== 'undefined') {
    return (async () =>
      new Promise((resolve, reject) => {
        // @ts-ignore
        chrome.storage.local.get([key], result => {
          // @ts-ignore
          const err = chrome.runtime.lastError
          if (err) {
            reject(err)
            return
          }

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
      new Promise((resolve, reject) => {
        // @ts-ignore
        chrome.storage.local.set({ [key]: value }, () => {
          // @ts-ignore
          const err = chrome.runtime.lastError
          if (err) {
            reject(err)
            return
          }

          resolve()
        })
      }))()
  }
}
