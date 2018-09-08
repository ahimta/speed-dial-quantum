// at the moment, only Firefox and Chromium are supported :)
const platformName = typeof browser !== 'undefined' ? 'firefox' : 'chromium'

// storage: get, set
exports.get =
  platformName === 'firefox'
    ? firefoxGet
    : platformName === 'chromium'
      ? chromiumGet
      : null

exports.set =
  platformName === 'firefox'
    ? firefoxSet
    : platformName === 'chromium'
      ? chromiumSet
      : null

// messaging: onMessage, sendMessage
exports.onMessage =
  platformName === 'firefox'
    ? listener => browser.runtime.onMessage.addListener(listener)
    : platformName === 'chromium'
      ? listener => chrome.runtime.onMessage.addListener(listener)
      : null

exports.sendMessage =
  platformName === 'firefox'
    ? message => browser.runtime.sendMessage(message)
    : platformName === 'chromium'
      ? message => chrome.runtime.sendMessage(message)
      : null

// tabs: activeTab, createTab, updateTab

exports.createTab =
  platformName === 'firefox'
    ? options => browser.tabs.create(options)
    : platformName === 'chromium'
      ? options => chrome.tabs.create(options)
      : null

exports.updateTab =
  platformName === 'firefox'
    ? options => browser.tabs.update(options)
    : platformName === 'chromium'
      ? options => chrome.tabs.update(options)
      : null

exports.activeTab = async () => {
  const tab =
    platformName === 'firefox'
      ? (await browser.tabs.query({ active: true }))[0]
      : (await chromiumActiveTabs())[0]

  const { id, title, url } = tab
  return { id, title, url }
}

// topSites
exports.topSites =
  platformName === 'firefox' ? firefoxTopSites : chromiumTopSites

function chromiumActiveTabs () {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, activeTabs => {
      const err = chrome.runtime.lastError
      if (err) {
        reject(err)
        return
      }

      resolve(activeTabs)
    })
  })
}

function chromiumTopSites () {
  return new Promise((resolve, reject) => {
    chrome.topSites.get(sites => {
      const err = chrome.runtime.lastError

      if (err) {
        reject(err)
        return
      }

      resolve(sites.map(({ url, title }) => ({ url, title })))
    })
  })
}

async function firefoxGet (key) {
  return (await browser.storage.local.get(key))[key]
}

function firefoxSet (key, value) {
  return browser.storage.local.set({ [key]: value })
}

async function firefoxTopSites () {
  const sites = await browser.topSites.get()

  return sites.map(({ url, title }) => ({ url, title }))
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
