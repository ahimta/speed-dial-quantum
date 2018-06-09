export function getFaviconImgUrl (url) {
  if (!url) {
    return ''
  }

  const match = url.match(/^https?:\/\/([^/]+)/)

  if (!match) {
    return ''
  }

  const baseUrl = match[0]
  return `${baseUrl}/favicon.ico`
}

// copied and modified from StackOverflow -_-:
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
