// at the moment, only Firefox and Chromium are supported :)
const platformName = typeof browser !== 'undefined' ? 'firefox' : 'chromium'

// storage: get, set
export const get =
  platformName === 'firefox'
    ? firefoxGet
    : platformName === 'chromium'
      ? chromiumGet
      : null

export const set =
  platformName === 'firefox'
    ? firefoxSet
    : platformName === 'chromium'
      ? chromiumSet
      : null

// messaging: onMessage, sendMessage
export const onMessage =
  platformName === 'firefox'
    ? listener => browser.runtime.onMessage.addListener(listener)
    : platformName === 'chromium'
      ? listener => chrome.runtime.onMessage.addListener(listener)
      : null

export const sendMessage =
  platformName === 'firefox'
    ? message => browser.runtime.sendMessage(message)
    : platformName === 'chromium'
      ? message => chrome.runtime.sendMessage(message)
      : null

// tabs: createTab, updateTab
export const createTab =
  platformName === 'firefox'
    ? options => browser.tabs.create(options)
    : platformName === 'chromium'
      ? options => chrome.tabs.create(options)
      : null

export const updateTab =
  platformName === 'firefox'
    ? options => browser.tabs.update(options)
    : platformName === 'chromium'
      ? options => chrome.tabs.update(options)
      : null

async function firefoxGet (key) {
  return (await browser.storage.local.get())[key]
}

function firefoxSet (key, value) {
  return browser.storage.local.set({ [key]: value })
}

function chromiumSet (key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      const err = chrome.runtime.lastError
      if (err) {
        reject(err)
        return
      }

      resolve()
    })
  })
}

function chromiumGet (key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], result => {
      const err = chrome.runtime.lastError
      if (err) {
        reject(err)
        return
      }

      resolve(result[key])
    })
  })
}
