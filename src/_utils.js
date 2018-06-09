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
