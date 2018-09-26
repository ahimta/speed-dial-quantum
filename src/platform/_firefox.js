module.exports = {
  // storage: get, set
  get: async key => (await browser.storage.local.get(key))[key],
  set: (key, value) => module.exports.setMany({ [key]: value }),
  setMany: obj => browser.storage.local.set(obj),

  // messaging: onMessage, sendMessage
  onMessage: listener => browser.runtime.onMessage.addListener(listener),
  sendMessage: message => browser.runtime.sendMessage(message),

  // tabs: activeTab, createTab, updateTab
  activeTab: async () => {
    const tab = (await browser.tabs.query({ active: true }))[0]
    const { id, title, url } = tab

    return { id, title, url }
  },
  createTab: options => browser.tabs.create(options),
  updateTab: options => browser.tabs.update(options),

  // topSites
  topSites: async () => {
    const sites = await browser.topSites.get()

    return sites.map(({ url, title }) => ({ url, title }))
  }
}
