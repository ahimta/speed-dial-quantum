exports.getFaviconImgUrl = url => {
  if (!url) {
    return ''
  }

  const match = url.match(/^https?:\/\/([^/]+)/)

  if (!match) {
    return ''
  }

  const baseUrl = match[0]
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    baseUrl
  )}`
}

// copied and modified from StackOverflow -_-:
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
exports.uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
