module.exports = {
  // storage: get, set
  get: key =>
    new Promise((resolve, reject) => {
      chrome.storage.local.get([key], result => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(err)
          return
        }

        resolve(result[key])
      })
    }),
  set: (key, value) => module.exports.setMany({ [key]: value }),
  setMany: obj =>
    new Promise((resolve, reject) => {
      chrome.storage.local.set(obj, () => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    }),

  // messaging: onMessage, sendMessage
  onMessage: listener => chrome.runtime.onMessage.addListener(listener),
  sendMessage: message => chrome.runtime.sendMessage(message),

  // tabs: activeTab, createTab, updateTab
  activeTab: () =>
    new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true }, activeTabs => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(err)
          return
        }

        const tab = activeTabs[0]
        const { id, title, url } = tab

        resolve({ id, title, url })
      })
    }),
  createTab: options => chrome.tabs.create(options),
  updateTab: options => chrome.tabs.update(options),

  // topSites
  topSites: () =>
    new Promise((resolve, reject) => {
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
